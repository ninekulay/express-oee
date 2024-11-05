const mongoose = require('mongoose');

// Define a simple schema and model for testing
// const testSchema = new mongoose.Schema({
//   createdAt: { type: Date, default: Date.now },
// });

const testSchema = new mongoose.Schema({
  name: { type: String, required: true }, // String field
  time_from: { type: Date, required: true }, // Date field
  time_to: { type: Date, required: true }, // Date field
  created_at: { type: Date, default: Date.now }, // Automatically set current date
  updated_at: { type: Date, default: Date.now } // Automatically set current date
}, { versionKey: false }); // Ensure this is correctly placed

const TestModel = mongoose.model('Test', testSchema, 'machine_statuses');


const connectMongoDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connection name:', connection.connection.name);
    // const newDocument = await TestModel.create({
    //   name: "Sample Document", // Replace with your desired string
    //   time_from: new Date("2024-11-04T12:00:00Z"), // UTC datetime for time_from
    //   time_to: new Date("2024-11-04T13:00:00Z"), // UTC datetime for time_to
    //   created_at: new Date(), // Current date and time for created_at
    //   updated_at: new Date() // Current date and time for updated_at
    // });
    const lastDocument = await TestModel.findOne({}).sort({ createdAt: -1 }); // Sort by createdAt descending
    console.log('Last document:', lastDocument);

    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

module.exports = { mongoose, connectMongoDB };
