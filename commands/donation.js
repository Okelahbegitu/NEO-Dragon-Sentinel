const new_target = require('./donation/new_target');
const set_reach_target = require('./donation/set_reach_target');
const remove_target = require('./donation/remove_target');
const add_amount_target = require('./donation/add_amount_target');
const show_target = require('./donation/show_progress');
const target_donation = require('../models/target_donation');
const change_target = require('./donation/change_target');
const set_donation_notif_channel = require('./donation/set_donation_notif_channel');

const env = require('../config/env');

const { PermissionsBitField } = require('discord.js');



module.exports = {
	name: 'donation',
	description: 'Manage donation targets and amounts',
	options: [
		{
			name: 'new_target',
			description: 'Buat target donasi baru',
			type: 1,
			options: [
				{ name: 'name', description: 'Nama target', type: 3, required: true },
				{ name: 'goal_amount', description: 'Jumlah target (angka)', type: 4, required: true },
				{ name: 'description', description: 'Deskripsi target', type: 3, required: false },
			],
		},
		{
			name: 'set_reach_target',
			description: 'Set target reach/status',
			type: 1,
			options: [
				{ name: 'target_id', description: 'ID target (opsional)', type: 3, required: false },
			],
		},
		{
			name: 'remove_target',
			description: 'Hapus target donasi',
			type: 1,
			options: [
				{ name: 'target_id', description: 'ID target (opsional)', type: 3, required: false },
			],
		},
		{
			name: 'add_amount_target',
			description: 'Tambahkan donasi ke target',
			type: 1,
			options: [
				{ name: 'amount', description: 'Jumlah yang akan ditambahkan', type: 4, required: true },
				{ name: 'target_id', description: 'ID target (opsional)', type: 3, required: false },
			],
		},
		{
			name: 'show_target',
			description: 'Tampilkan progress target donasi',
			type: 1,
		},
		{
			name: 'change_target',
			description: 'Ubah detail target donasi',
			type: 1,
			options: [
				{ name: 'new_goal_amount', description: 'Jumlah target baru (angka)', type: 4, required: false },
				{ name: 'new_description', description: 'Deskripsi target baru', type: 3, required: false },
				{ name: 'new_name', description: 'Nama target baru', type: 3, required: false },
			],
		},
		{
			name: 'set_donation_notif_channel',
			description: 'Atur channel untuk notifikasi donasi',
			type: 1,
			options: [
				{ name: 'channel', description: 'Channel untuk notifikasi donasi', type: 7, required: true },
			],
		},

	],
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'new_target' && interaction.user.id === env.OWNER_ID) return new_target(interaction);
		if (subcommand === 'set_reach_target' && interaction.user.id === env.OWNER_ID) return set_reach_target(interaction);
		if (subcommand === 'remove_target' && interaction.user.id === env.OWNER_ID) return remove_target(interaction);
		if (subcommand === 'add_amount_target' && interaction.user.id === env.OWNER_ID) return add_amount_target(interaction);
		if (subcommand === 'show_target') return show_target(interaction);
		if (subcommand === 'change_target' && interaction.user.id === env.OWNER_ID) return change_target(interaction);
		if (subcommand === 'set_donation_notif_channel' && interaction.memberPermissions?.has(
			PermissionsBitField.Flags.Administrator
		)) return set_donation_notif_channel(interaction);
		return interaction.reply({ content: 'Subcommand tidak dikenal atau Anda tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
	}
};