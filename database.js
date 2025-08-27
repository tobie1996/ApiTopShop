const mongoose = require('mongoose');

const connectDB = async () => {
  try {
     await mongoose.connect('mongodb+srv://tobiemba:m2RFDCOLbSpx47xB@cluster0.6sq0pza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // await mongoose.connect('mongodb://localhost:27017/TopShopDB', {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('Connecté à MongoDB');
    });
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;