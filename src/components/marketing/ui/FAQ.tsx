"use client";

import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

export default function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      {items.map((x) => (
        <Accordion key={x.q} elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)", mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography sx={{ fontWeight: 900 }}>{x.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>{x.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
