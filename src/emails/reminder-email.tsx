import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function ReminderEmail(props: {
  memberName: string;
  assignedDateLabel: string;
  deliveryAddress: string;
  coordinatorEmail?: string | null;
  zoneName: string;
  appUrl?: string;
}) {
  const {
    memberName,
    assignedDateLabel,
    deliveryAddress,
    coordinatorEmail,
    zoneName,
    appUrl,
  } = props;

  return (
    <Html>
      <Head />
      <Preview>{`Thaali pickup reminder — ${assignedDateLabel}`}</Preview>
      <Body style={{ backgroundColor: "#fbf9f6", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
          <Section style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Img
              src={`${appUrl ?? ""}/logo.png`}
              width="40"
              height="40"
              alt="Thaali Rotation Manager"
              style={{ borderRadius: 12, display: "block" }}
            />
            <div>
              <Heading style={{ fontSize: 18, margin: 0 }}>
                Thaali Rotation Manager
              </Heading>
              <Text style={{ margin: 0, color: "#434843", fontSize: 12 }}>
                {zoneName}
              </Text>
            </div>
          </Section>

          <Hr style={{ borderColor: "#e3e2e0", margin: "20px 0" }} />

          <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>
            Pickup reminder
          </Heading>
          <Text style={{ margin: "0 0 12px", color: "#1b1c1a" }}>
            Salaam {memberName}, this is a reminder that you are scheduled for a
            thaali pickup on <strong>{assignedDateLabel}</strong>.
          </Text>

          <Section>
            <Text style={{ margin: "0 0 6px", color: "#434843", fontSize: 12 }}>
              Delivery address
            </Text>
            <Text style={{ margin: 0, color: "#1b1c1a" }}>{deliveryAddress}</Text>
          </Section>

          {coordinatorEmail ? (
            <Section style={{ marginTop: 16 }}>
              <Text style={{ margin: "0 0 6px", color: "#434843", fontSize: 12 }}>
                Questions?
              </Text>
              <Text style={{ margin: 0, color: "#1b1c1a" }}>
                Contact your coordinator: {coordinatorEmail}
              </Text>
            </Section>
          ) : null}

          <Hr style={{ borderColor: "#e3e2e0", margin: "20px 0" }} />

          <Text style={{ margin: 0, color: "#434843", fontSize: 12 }}>
            Mehdi Automates — Build. Automate. Ship.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

