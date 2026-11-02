import type { Customer, Transaction, TransactionStatus } from "../generated/prisma";

type CustomersEventSource = Pick<
  Transaction,
  "id" | "quantity" | "totalPrice" | "status" | "customerId" | "ticketTypeId" | "paymentProofUrl"
>;

export class CustomersEventResponseDTO {
  transactionId: string;
  customerId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  ticketTypeName: string;
  status: TransactionStatus;
  paymentProofUrl: string | null;

  constructor(transaction: CustomersEventSource, customerName: string, ticketType: string) {
    this.transactionId = transaction.id;
    this.name = customerName;
    this.customerId = transaction.customerId;
    this.quantity = transaction.quantity;
    this.totalPrice = transaction.totalPrice.toNumber();
    this.ticketTypeName = ticketType;
    this.status = transaction.status;
    this.paymentProofUrl = transaction.paymentProofUrl;
  }
}