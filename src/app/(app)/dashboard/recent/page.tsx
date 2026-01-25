"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

export default function RecentPapersPage() {
  return (
    <Box>
      <Typography sx={{ fontWeight: 950, fontSize: 22, mb: 0.5 }}>
        Recent Papers
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        Quick access to your latest uploads.
      </Typography>

      <Stack spacing={1.2}>
        {/* Placeholder UI — next we will connect GET /history and slice latest */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900 }}>Paper #{i}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Uploaded recently • Click to open
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
