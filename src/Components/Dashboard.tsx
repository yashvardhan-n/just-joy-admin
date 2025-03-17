import React, { useState, useEffect } from "react";
import { CircularProgress, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import DashboardCard from "./Dashboard-Card";
import BookingsList from "./BookingList";
import axios from 'axios' ; 



import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";


interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  todayBookings: number;
}

const targetUrl = 'https://just-joy-backend.vercel.app';
const Dashboard: React.FC = () => {

  const [stats , setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    todayBookings: 0,
  });

  const [isLoading , setIsLoading] = useState(false) ; 
  useEffect(() => {
    const BookedDataStats = async() =>{
      try {
        setIsLoading(true)  
        const response = await axios.get(`${targetUrl}/api/stats`);
        setStats(response.data) ;
      } catch (error) {
        console.log("Error Occured While Fetching Booked Data") ;
      }
      finally{
        setIsLoading(false) ; 
      }
    }
    BookedDataStats() ;
  }, []);

  const handleUpdateStats = async() =>{
    try {
      setIsLoading(true)  
      const response = await axios.get(`${targetUrl}/api/stats`);
      setStats(response.data) ;
    } catch (error) {
      console.log("Error Occured While Fetching Booked Data") ;
    }
    finally{
      setIsLoading(false)
    }
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 4}}>
      <Typography variant="h4" sx={{ mb: 4 , display : 'flex' , justifyContent : 'center'  }}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}  display={"flex"} justifyContent={"space-between"}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {
          <DashboardCard
            title="Total Bookings"
            value={(isLoading ) ? <CircularProgress size={25} /> : stats.totalBookings}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
          }
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Pending"
            value={(isLoading ) ? <CircularProgress size={25} /> : stats.pendingBookings}
            icon={<PendingIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardCard
            title="Confirmed"
            value={(isLoading ) ? <CircularProgress size={25} /> : stats.confirmedBookings}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12 }} >
          <BookingsList 
            onChangeStats = {handleUpdateStats}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
