const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * ============================================================
 * TEMPLATE MODEL SEQUELIZE
 * Salin file ini untuk membuat model baru
 * ============================================================
 *
 * TIPE DATA YANG TERSEDIA:
 * DataTypes.STRING(n)   → VARCHAR(n)
 * DataTypes.TEXT        → TEXT (panjang tak terbatas)
 * DataTypes.INTEGER     → INT
 * DataTypes.BIGINT      → BIGINT (untuk Discord ID)
 * DataTypes.BOOLEAN     → TINYINT(1)
 * DataTypes.DATE(3)     → DATETIME(3) dengan milidetik
 * DataTypes.JSON        → JSON
 * DataTypes.ENUM(...)   → ENUM
 *
 * OPSI KOLOM:
 * primaryKey: true      → jadikan primary key
 * allowNull: false      → NOT NULL
 * defaultValue: ...     → nilai default
 * unique: true          → nilai harus unik
 * autoIncrement: true   → auto increment (untuk INT)
 * ============================================================
 */

const Example = sequelize.define('Example', {

  // Primary key manual (seperti Discord ID)
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },

  // Primary key auto increment
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true
  // },

  // Contoh kolom string
  username: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  // Contoh kolom angka dengan default
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // Contoh kolom boolean
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  // Contoh kolom ENUM (pilihan tetap)
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active'
  },

  // Contoh kolom tanggal
  lastSeen: {
    type: DataTypes.DATE(3),
    allowNull: true
  },

  // Contoh kolom JSON (simpan object/array)
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }

}, {
  tableName: 'example',   // nama tabel di MySQL
  timestamps: true,       // true = auto kelola createdAt & updatedAt
                          // false = kelola sendiri atau tidak pakai
});

module.exports = Example;

/**
 * ============================================================
 * CONTOH RELASI (uncomment kalau dibutuhkan)
 * ============================================================
 *
 * ONE TO MANY (1 user punya banyak history)
 * Example.hasMany(ModelLain, { foreignKey: 'example_id' });
 * ModelLain.belongsTo(Example, { foreignKey: 'example_id' });
 *
 * ONE TO ONE (1 user punya 1 profile)
 * Example.hasOne(ModelLain, { foreignKey: 'example_id' });
 * ModelLain.belongsTo(Example, { foreignKey: 'example_id' });
 *
 * MANY TO MANY (user bisa punya banyak role, role bisa dimiliki banyak user)
 * Example.belongsToMany(ModelLain, { through: 'TabelPerantara' });
 * ModelLain.belongsToMany(Example, { through: 'TabelPerantara' });
 * ============================================================
 *
 * CONTOH QUERY:
 * ============================================================
 *
 * CREATE
 * await Example.create({ id: '123', username: 'Fardan' });
 *
 * READ ONE
 * await Example.findOne({ where: { id: '123' } });
 *
 * READ ALL
 * await Example.findAll({ where: { status: 'active' } });
 *
 * UPDATE
 * await Example.update({ xp: 100 }, { where: { id: '123' } });
 *
 * UPSERT (insert atau update kalau sudah ada)
 * await Example.upsert({ id: '123', username: 'Fardan', xp: 100 });
 *
 * DELETE
 * await Example.destroy({ where: { id: '123' } });
 * ============================================================
 */