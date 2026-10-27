import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TransactionalEmailProps {
  userName: string;
  transactionId: string;
  amount: number;
  status: string;
}

export const TransactionalEmail = ({
  userName = "Valued Member",
  transactionId = "tx_12345",
  amount = 0.00,
  status = "PENDING",
}: TransactionalEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Transaction Update: {status}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Transaction Update</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We are writing to inform you that the status of your recent transaction (ID: <strong>{transactionId}</strong>) is now: <strong>{status}</strong>.
          </Text>
          <Text style={text}>
            Amount: ${amount.toFixed(2)}
          </Text>
          <Text style={text}>
            If you did not authorize this transaction, please contact our support team immediately.
          </Text>
          <Text style={footer}>
            Best regards,<br />
            The Architectural AI Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TransactionalEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
};

const h1 = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const footer = {
  color: "#8898aa",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "14px",
  lineHeight: "16px",
  padding: "0 40px",
  marginTop: "20px",
};
