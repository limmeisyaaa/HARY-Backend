import type { Customer, Transaction, TransactionStatus } from "../generated/prisma";

type CustomersEventSource = Pick<
  Transaction,
  "id" | "quantity" | "totalPrice" | "status" | "customerId" | "ticketTypeId"
>;

export class CustomersEventResponseDTO {
  id: string;
  customerId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  ticketTypeName: string;
  status: TransactionStatus;

  constructor(transaction: CustomersEventSource, customerName: string, ticketType: string) {
    this.id = transaction.id;
    this.name = customerName;
    this.customerId = transaction.customerId;
    this.quantity = transaction.quantity;
    this.totalPrice = transaction.totalPrice.toNumber();
    this.ticketTypeName = ticketType;
    this.status = transaction.status;
  }
}