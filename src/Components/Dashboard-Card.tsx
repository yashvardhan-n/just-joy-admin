import React, { JSX } from "react";
import { Paper, Box, Typography } from "@mui/material";

interface DashboardCardProps {
  title: string;
  value: JSX.Element | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: 110,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          p: 2,
          color: color,
        }}
      >
        {icon}
      </Box>

      <Typography variant="h6" component="div" sx={{ mb: 1 , display : 'flex' , justifyContent : 'center'  }}>
        {title}
      </Typography>

      <Typography
        variant="h4"
        component="div"
        sx={{ mt: "auto", color: color , display : 'flex' , justifyContent : 'center' }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default DashboardCard;
