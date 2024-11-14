const { model, Schema } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = "Product";
const COLLECTIONS_NAME = "Products";

// Declare the Schema of the Mongo model
const productSchema = new Schema({
  product_name: { type: String, required: true },
  product_thumb: { type: String, required: true },
  product_description: String,
  product_slug: String,
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: {
    type: String,
    required: true,
    enum: ['Phone', 'Watch', 'Tablet', 'Accessory']
  },
  product_attributes: { type: Schema.Types.Mixed, required: true }, // Store specific product attributes
  product_ratingsAverage: {
    type: Number,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    default: 4.5,
    set: (val) => Math.round(val * 10) / 10 // Round to 1 decimal place
  },
  product_variations: { type: Array, default: [] }, // For multiple variations (colors, sizes, etc.)

  isPublished: { type: Boolean, default: false, index: true, select: false },
}, {
  collection: COLLECTIONS_NAME,
  timestamps: true, // Adds createdAt and updatedAt
});

// Create index for searching by keySearch
productSchema.index({ product_name: 'text', product_description: 'text' });

// Define middleware to convert product_name to product_slug
productSchema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// PHONE Schema
const phoneSchema = new Schema({
  phone_brand: { type: String, required: true },
  color: String,
  storage_capacity: String, // For example: 64GB, 128GB, etc.
  screen_size: String, // Screen size in inches
  battery_capacity: String, // Battery capacity in mAh
}, {
  collection: 'Phones',
  timestamps: true
});

// WATCH Schema
const watchSchema = new Schema({
  watch_brand: { type: String, required: true },
  watch_type: { type: String, required: true }, // e.g., Smartwatch, Analog, Digital
  color: String,
  band_material: String, // e.g., Leather, Metal, Silicone
  water_resistant: { type: Boolean, default: true }, // Boolean for water resistance
}, {
  collection: 'Watches',
  timestamps: true
});

// TABLET Schema (Replacing Electronics)
const tabletSchema = new Schema({
  tablet_brand: { type: String, required: true },
  color: String,
  storage_capacity: String, // e.g., 64GB, 128GB, etc.
  screen_size: String, // Screen size in inches
  battery_capacity: String, // Battery capacity in mAh
  operating_system: String, // e.g., Android, iOS, etc.
}, {
  collection: 'Tablets',
  timestamps: true
});

// ACCESSORIES Schema
const accessorySchema = new Schema({
  accessory_type: { type: String, required: true }, // e.g., Charger, Headphones, Case
  brand: String,
  color: String,
  material: String
}, {
  collection: 'Accessories',
  timestamps: true
});

// Export the models
module.exports = {
  Product: model(DOCUMENT_NAME, productSchema),
  Phone: model('Phone', phoneSchema),
  Watch: model('Watch', watchSchema),
  Tablet: model('Tablet', tabletSchema), // Tablet instead of Electronics
  Accessory: model('Accessory', accessorySchema),
};
