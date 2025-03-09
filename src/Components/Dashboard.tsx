import React, { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import DashboardCard from "./Dashboard-Card";
import BookingsList , {Booking} from "./BookingList";
import axios from 'axios' ; 


import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  PendingActions as PendingPaymentIcon ,
} from "@mui/icons-material";
import { BookingStatus } from "./BookingList";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  todayBookings: number;
}

const Dashboard: React.FC = () => {

  const [stats , setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    todayBookings: 0,
  });

  useEffect(() => {
    const BookedDataStats = async() =>{
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data) ;
      } catch (error) {
        console.log("Error Occured While Fetching Booked Data") ;
      }
    }
    BookedDataStats() ;
  }, []);

  const handleDeletedStats = (booking : Booking) =>{
            const status = booking.status ;
            const bookingDate = new Date(booking.createdAt).toISOString().split("T")[0];

            try{
              setStats((prevStats) => {
                const updatedStats = {...prevStats};
                updatedStats.totalBookings-- ;

                if(status === BookingStatus.Pending)updatedStats.pendingBookings-- ;
                if(status === BookingStatus.Confirmed)updatedStats.confirmedBookings-- ;

                const today = new Date().toISOString().split("T")[0];
                if(today === bookingDate){
                    updatedStats.todayBookings-- ;
                }
                return updatedStats ;
            })            
        } catch (error) {
            console.log("Error Occurred While Deleting Booking") ;
        }
  }

  const handleUpdateStatusStats = (booking : Booking , newStatus : string) =>{
    try {
      const status = booking.status ;
      
      setStats((prevStats) => {
          const updatedStats = {...prevStats} ;
          if(status === BookingStatus.Pending && newStatus === BookingStatus.Confirmed){
              updatedStats.confirmedBookings++ ;
              updatedStats.pendingBookings-- ;
          }
          else if(status === BookingStatus.Pending && newStatus === BookingStatus.Waiting){
            updatedStats.pendingBookings-- ;
            updatedStats.todayBookings++ ;
          }
          else if(status === BookingStatus.Pending && newStatus === BookingStatus.Cancelled){
            updatedStats.pendingBookings-- ;
        }

          else if(status === BookingStatus.Confirmed && newStatus === BookingStatus.Pending){
              updatedStats.confirmedBookings-- ;
              updatedStats.pendingBookings++ ;
          }
          else if(status === BookingStatus.Confirmed && newStatus === BookingStatus.Cancelled){
              updatedStats.confirmedBookings-- ;
          }
          else if(status === BookingStatus.Confirmed && newStatus === BookingStatus.Waiting){
            updatedStats.confirmedBookings-- ;
            updatedStats.todayBookings++ ; 
          }
          

          return updatedStats ; 
      })
  } catch (error) {
      console.log("error Occured While handling Update Status" , error) ;
  }
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 4}}>
      <Typography variant="h4" sx={{ mb: 4 , display : 'flex' , justifyContent : 'center'  }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Pending"
            value={stats.pendingBookings}
            icon={<PendingIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Confirmed"
            value={stats.confirmedBookings}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Payment Pending"
            value={stats.todayBookings}
            icon={<PendingPaymentIcon />}
            color="#9c27b0"
          />
        </Grid>

        <Grid size={{ xs: 12 }} >
          <BookingsList 
            onDelete= {handleDeletedStats}
            onChangeStatus = {handleUpdateStatusStats}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
