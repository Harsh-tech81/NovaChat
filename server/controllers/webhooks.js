import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        const session = sessionList.data[0];
        const { transactionId, appId } = session.metadata;
        if (appId === "NovaChat") {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          });
          // update the credits in User Account after the successful payment has been made
          await User.updateOne(
            { _id: transaction.userId },
            { $inc: { credits: transaction.credits } },
          );
          // update the transaction status to paid
          transaction.isPaid = true;
          await transaction.save();
        } else {
          return res.json({
            message: "Ignored event:Invalid App",
            received: true,
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }
    return res.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return res.status(500).send(`Internal Server Error: ${err.message}`);
  }
};
