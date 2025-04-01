const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  //reference to user connection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref :"User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

// ConnectionRequest.find({fromUserId :23456789, toUserId : 3456789 })
connectionRequestSchema.index({fromUserId: 1, toUserId: 1});
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1, status: 1 });

connectionRequestSchema.pre("save", function(next){
  const connectionRequest=this; 
  // check if the from UserId is same as toUserId
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("Cannot send connection request to Yourself!");
  } 
  next();
});  

const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequest;
