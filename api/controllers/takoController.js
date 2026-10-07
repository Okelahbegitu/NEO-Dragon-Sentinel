const crypto = require('crypto');

const env = require('../../config/env');
const client = require('../../index');

const tacoDonation = require('../../function/taco_donation');
const target_donation = require('../../models/target_donation');

function isValidWebhookSignature(payload, signature) {
    if (!signature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', env.TAKO_WEBTOKEN)
        .update(JSON.stringify(payload))
        .digest('hex');

    const signatureBuffer = Buffer.from(String(signature));
    const expectedBuffer = Buffer.from(expectedSignature);

    return (
        signatureBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(
            signatureBuffer,
            expectedBuffer
        )
    );
}

async function handleTako(req, res) {
    try {
        console.log(
            'Received taco donation webhook:',
            req.body
        );

        const tako_signature =
            req.headers['x-tako-signature'];

        if (!tako_signature) {
            return res.status(401).json({
                error: 'Missing signature'
            });
        }

        if (
            !isValidWebhookSignature(
                req.body,
                tako_signature
            )
        ) {
            console.warn(
                'Invalid signature for taco donation webhook'
            );

            return res.status(401).json({
                error: 'Invalid signature'
            });
        }

        await tacoDonation(req.body, client);

        const target_donation_res =
            await target_donation.findOne({
                where: {
                    status: 'unreached'
                },
                order: [
                    ['created_at', 'DESC']
                ]
            });

        if (target_donation_res) {
            target_donation_res.current_amount +=
                req.body.amount;

            console.log(
                `Updated target donation: ${target_donation_res.current_amount}`
            );

            if (
                target_donation_res.current_amount >=
                target_donation_res.goal_amount
            ) {
                target_donation_res.status = 'reached';
            }

            await target_donation_res.save();
        }

        return res.status(200).json({
            message: 'Webhook received'
        });

    } catch (error) {
        console.error(
            'Failed to handle taco donation webhook:',
            error
        );

        return res.status(500).json({
            error: 'Failed to handle webhook',
            details: error.message
        });
    }
}

module.exports = {
    handleTako
};