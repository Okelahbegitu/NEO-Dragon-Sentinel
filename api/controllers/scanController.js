const fs = require('fs');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs');
const nsfwjs = require('nsfwjs');

const alterScan = require('../../function/scan_alter');

let model;

async function loadModel() {
    console.log('Loading NSFW model...');

    model = await nsfwjs.load();

    console.log('NSFW model loaded');
}

loadModel();

function removeTempFile(filePath) {
    if (!filePath) return;

    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error(
            'Gagal menghapus file upload sementara:',
            error.message
        );
    }
}

async function scan(req, res) {
    let imageTensor;

    try {
        if (!model) {
            return res.status(503).json({
                error: 'Model NSFW belum siap.',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'Image tidak ditemukan',
            });
        }

        if (req.file.mimetype === 'image/gif') {
            return res.status(400).json({
                error: 'GIF tidak didukung',
            });
        }

        const { data, info } = await sharp(req.file.path)
            .rotate()
            .removeAlpha()
            .toColourspace('srgb')
            .raw()
            .toBuffer({
                resolveWithObject: true,
            });

        imageTensor = tf.tensor3d(
            data,
            [info.height, info.width, info.channels],
            'float32'
        );

        const expanded = imageTensor.expandDims(0);

        const predictions = await model.classify(expanded);

        expanded.dispose();

        return res.json({
            status: 'success',
            predictions,
        });

    } catch (error) {
        return res.status(400).json({
            error: 'Gagal memproses gambar.',
            details: error.message,
        });

    } finally {
        if (imageTensor) {
            imageTensor.dispose();
        }

        removeTempFile(req.file?.path);
    }
}

async function scanAlter(req, res) {
    try {
        await alterScan(req, res);
    } catch (error) {
        console.error('Error in /scan-alter:', error);

        return res.status(500).json({
            error: 'Terjadi kesalahan saat memproses permintaan.',
            details: error.message,
        });
    }
}

module.exports = {
    scan,
    scanAlter,
};