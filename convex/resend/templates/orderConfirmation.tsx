import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

export interface OrderConfirmationProps {
  childName: string;
  orderType: string;
  startDate: string;
  endDate: string;
  price: number; // in cents
}

// Format price from cents to euros
function formatPrice(cents: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

// Format order type to Dutch
function formatOrderType(orderType: string): string {
  const types: Record<string, string> = {
    "day-order": "Dagbestelling",
    "week-order": "Weekbestelling",
    "month-order": "Maandbestelling",
  };
  return types[orderType] || orderType;
}

// Format date to Dutch format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("nl-BE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  childName,
  orderType,
  startDate,
  endDate,
  price,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Bestelling bevestigd voor {childName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>🥪 Boterhammen op School</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading as="h1" style={title}>
              Bestelling Bevestigd!
            </Heading>
            <Text style={paragraph}>
              Bedankt voor uw bestelling. Hieronder vindt u de details van uw bestelling.
            </Text>

            <Hr style={divider} />

            {/* Order Details */}
            <Section style={orderDetails}>
              <Heading as="h2" style={subtitle}>
                Bestelgegevens
              </Heading>
              
              <table style={table}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Kind:</td>
                    <td style={valueCell}>{childName}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Type bestelling:</td>
                    <td style={valueCell}>{formatOrderType(orderType)}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Startdatum:</td>
                    <td style={valueCell}>{formatDate(startDate)}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Einddatum:</td>
                    <td style={valueCell}>{formatDate(endDate)}</td>
                  </tr>
                </tbody>
              </table>

              <Hr style={divider} />

              <table style={table}>
                <tbody>
                  <tr>
                    <td style={labelCell}>
                      <strong>Totaal betaald:</strong>
                    </td>
                    <td style={priceCell}>
                      <strong>{formatPrice(price)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Heeft u vragen over uw bestelling? Neem gerust contact met ons op.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Boterhammen op School. Alle rechten voorbehouden.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header: React.CSSProperties = {
  backgroundColor: "#16a34a",
  padding: "24px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "32px 24px",
};

const title: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const subtitle: React.CSSProperties = {
  color: "#374151",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const paragraph: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const orderDetails: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const labelCell: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "14px",
  padding: "8px 0",
  width: "40%",
  verticalAlign: "top",
};

const valueCell: React.CSSProperties = {
  color: "#1f2937",
  fontSize: "14px",
  padding: "8px 0",
  fontWeight: "500",
};

const priceCell: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "18px",
  padding: "8px 0",
  fontWeight: "bold",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0",
};

export default OrderConfirmation;

