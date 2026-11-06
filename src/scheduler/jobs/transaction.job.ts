import TransactionRepository from "../../repositories/transaction.repository";
import { createScheduler } from "../runner";

export const expirePaymentJob = () => {
  createScheduler("*/1 * * * *", async () => {
    const expired = await TransactionRepository.findExpiredPayments(new Date());
    let done = 0;
    for (const { id } of expired) {
      try {
        await TransactionRepository.releaseTransaction(id, "EXPIRED", "SYSTEM");
        done++;
      } catch (err) {
        console.error(`Expire ${id} skipped:`, err);
        //409 user acted first
      }
    }
    console.log(`Expired ${done} transaction(s)`);
  });
};

export const cancelUnconfirmedJob = () => {
  createScheduler("*/10 * * * *", async () => {
    const unconfirmed = await TransactionRepository.findOverdueConfirmations(
      new Date(),
    );
    let done = 0;
    for (const { id } of unconfirmed) {
      try {
        await TransactionRepository.releaseTransaction(
          id,
          "CANCELED",
          "SYSTEM",
        );
        done++;
      } catch (err) {
        console.error(`Cancel ${id} skipped:`, err);
      }
    }
    console.log(`Canceleds ${done} transaction(s)`);
  });
};
