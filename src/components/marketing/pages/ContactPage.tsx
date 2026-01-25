"use client";

import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import MarketingLayout from "../MarketingLayout";
import Section from "../ui/Section";
import { marketing } from "@/data/marketing";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <MarketingLayout>
      <Section>
        <Paper elevation={0} sx={{ p: { xs: 3.5, md: 5 }, borderRadius: 5, maxWidth: 720, mx: "auto" }}>
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 38 } }}>
              {marketing.contact.title}
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              {marketing.contact.desc}
            </Typography>
          </Stack>

          {sent && <Alert severity="success">Message sent (UI only). Hook backend later.</Alert>}

          <Stack spacing={2.2} sx={{ mt: 2 }}>
            <TextField label="Name" placeholder="Your name" />
            <TextField label="Email" placeholder="name@example.com" />
            <TextField label="Message" placeholder="Tell us what you need..." multiline minRows={4} />
            <Button
              variant="contained"
              onClick={() => setSent(true)}
              sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" }, fontWeight: 900, py: 1.3 }}
            >
              Send message
            </Button>
          </Stack>
        </Paper>
      </Section>
    </MarketingLayout>
  );
}
