import AppError from "../../errors/app-error";
import { TransactionStatus } from "../../generated/prisma";
import CouponRepository from "../../repositories/coupon.repository";
import PointRepository from "../../repositories/point.repository";
import TicketTypeRepository from "../../repositories/ticket-type.repository";
import TransactionRepository from "../../repositories/transaction.repository";
import VoucherRepository from "../../repositories/voucher.repository";
import {
  TransactionCheckoutSchema,
  TransactionUpdateCheckoutSchema,
  TransactionUpdateStatusSchema,
} from "../../validators/transaction.validator";

const TransactionService = {
  updateStatusTransaction: async (data: TransactionUpdateStatusSchema) => {
    return TransactionRepository.updateTransactionStatus(data.id, data.status);
  },
  updateCheckout: async (
    id: string,
    customerId: string,
    input: TransactionUpdateCheckoutSchema,
  ) => {
    // find transaction
    const findTransaction = await TransactionRepository.findById(id);
    if (findTransaction == null)
      throw new AppError("Transaction not found", 404);
    // confirm ownership
    const owner = findTransaction.customerId;

    if (owner !== customerId)
      throw new AppError("Unauthorized change request", 403);
    // check status if its not WAITING_PAYMENT
    const status = findTransaction.status;

    if (status != "WAITING_PAYMENT")
      throw new AppError("Transaction no longer accepting changes", 409);
    // check expiration
    const expiresAt = findTransaction.expiresAt;
    const getNow = new Date(Date.now());

    if (expiresAt < getNow) throw new AppError("Transaction expired", 400);
    // update seat
    const seatDiff = input.quantity - findTransaction.quantity;
    let voucher = 0;
    let coupon = 0;
    let pointsUsed = 0;
    let usedPointIds: string[] = [];
    let leftOvers: { amount: number; expiresAt: Date } | null = null;

    // check voucher
    if (input.voucherId) {
      const getVoucher = await VoucherRepository.findById(input.voucherId);
      if (getVoucher) {
        const checkVoucher =
          getVoucher.eventId === findTransaction.eventId &&
          getVoucher.status == "AVAILABLE" &&
          getVoucher.endDate > getNow;
        if (checkVoucher) {
          voucher = Number(getVoucher.discountAmount);
        } else throw new AppError("Voucher invalid", 400);
      } else throw new AppError("Voucher not found", 404);
    }
    // check coupon
    if (input.couponId) {
      const getCoupon = await CouponRepository.findById(input.couponId);
      if (getCoupon) {
        const checkCoupon =
          getCoupon.customerId === customerId &&
          getNow < getCoupon.expiresAt &&
          (!getCoupon.isUsed || getCoupon.id == findTransaction.couponId);
        if (checkCoupon) coupon = Number(getCoupon.discountAmount);
        else throw new AppError("Coupon invalid", 400);
      } else throw new AppError("Coupon not found", 404);
    }

    const ticketType = await TicketTypeRepository.findByIdWithEvent(
      findTransaction.ticketTypeId,
    );

    if (!ticketType) throw new AppError("Ticket type not found!", 404);

    let remaining = Number(ticketType.price) * input.quantity;
    remaining = Math.max(0, remaining - voucher);
    remaining = Math.max(0, remaining - coupon);

    // calculate points subtract and save remaining points only if usePoints

    if (input.usePoints && remaining > 0) {
      const getPoints =
        await PointRepository.findAvailablePointsByCustomerId(customerId);
      if (getPoints && getPoints.length > 0) {
        for (let point of getPoints) {
          let need = remaining - pointsUsed;
          usedPointIds.push(point.id);

          const amount = Number(point.amount);
          if (amount <= need) {
            pointsUsed += amount;
          } else {
            pointsUsed += need;
            leftOvers = {
              amount: amount - need,
              expiresAt: point.expiresAt,
            };
            break;
          }

          if (pointsUsed === remaining) break;
        }
      }
    }

    const refundPoints = Number(findTransaction.pointsUsed);

    const totalPrice = remaining - pointsUsed;

    return await TransactionRepository.updateCheckoutTx({
      customerId,
      eventId: findTransaction.eventId,
      seatDiff,
      usedPointIds,
      transactionId: id,
      leftOvers,
      refundPoints,
      newCouponId: input.couponId ?? null,
      oldCouponId: findTransaction.couponId,
      data: {
        quantity: input.quantity,
        voucherId: input.voucherId ?? null,
        couponId: input.couponId ?? null,
        pointsUsed,
        totalPrice,
      },
    });
  },

  checkout: async (customerId: string, input: TransactionCheckoutSchema) => {
    // find the ticket type
    const ticketType = await TicketTypeRepository.findByIdWithEvent(
      input.ticketTypeId,
    );
    if (!ticketType)
      throw new AppError("Ticket type not found or removed", 404);
    // check event ended
    const now = new Date();

    const eventEndedAt = ticketType.event.endDate;

    if (now > eventEndedAt) throw new AppError("Event ended", 400);
    // check active transaction

    const findTransactionByCustomerId =
      await TransactionRepository.findActiveByCustomerAndEvent(
        customerId,
        ticketType.eventId,
      );

    if (findTransactionByCustomerId)
      throw new AppError(
        "Customer still has the transaction ongoing on the same event",
        409,
      );

    // check enough seats

    const availableSeats = ticketType.event.availableSeats;

    const seatsRequested = input.quantity;

    const delta = availableSeats - seatsRequested;

    if (delta < 0)
      throw new AppError("Not enough seats available in this event!", 400);

    // calculate price

    let price = 0;
    let expiresAt: Date;

    // is free?
    let defaultStatus: TransactionStatus = "WAITING_PAYMENT";
    if (ticketType.event.isFree) {
      defaultStatus = "DONE";
      expiresAt = new Date(Date.now());
      //create transaction
    } else {
      // define expires at
      price = seatsRequested * Number(ticketType.price);
      expiresAt = new Date(Date.now() + 60 * 60 * 1000); // init time 1 hour from creation
    }

    //create transaction

    return TransactionRepository.createWithSeatHold({
      customerId,
      eventId: ticketType.eventId,
      ticketTypeId: ticketType.id,
      quantity: seatsRequested,
      totalPrice: price,
      expiresAt,
      status: defaultStatus,
    });
  },
  cancelTransaction: async (id: string, customerId: string) => {
    const findTransaction = await TransactionRepository.findById(id);
    if(findTransaction == null) throw new AppError("Transaction not found", 404);

    if(findTransaction.customerId != customerId) throw new AppError("Unauthorized request detected", 403);

    const status ="CANCELED";
    const updatedBy = "CUSTOMER";
    return await TransactionRepository.releaseTransaction(
      id,
      status,
      updatedBy,
    );
  },
};

export default TransactionService;
