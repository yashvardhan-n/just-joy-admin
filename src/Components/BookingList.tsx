import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu ,
  MenuItem, 
  CircularProgress,
  Button,
} from "@mui/material";
import {Delete as DeleteIcon } from "@mui/icons-material";

export enum BookingStatus{
  Pending = 'Pending',
  Confirmed = 'Confirmed' ,
  Cancelled = 'Cancelled' ,
  Waiting = 'Waiting For Payment',
}
export interface Booking {
  _id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt : Date;
  guests : string;
}

interface BookingListProp{
  onDelete : (booking : Booking) => void 
  onChangeStatus : (booking : Booking , status : string) => void
}

const BookingsList: React.FC<BookingListProp> = ({ onDelete , onChangeStatus }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl , setAnchorEl] = useState<null | HTMLElement>(null) ;
  const [selectedBooking , setSelectedBooking] = useState<Booking | null>(null) ;
  
  const [isLoading, setIsLoading] = useState(false);
  const [bookingsData , setBookingsData] = useState<Booking[]>([]) ;

  const [applyId , setApplyId] = useState<string>("") ;
  const [tempStatus , setTempStatus] = useState<Record<string , BookingStatus>>({}) ;
  const [tempSelected , setTempSelected] = useState<Record<string , Booking>>({}) ;

  useEffect(() =>{
    const BookedData = async() =>{
      try {
        const response = await axios.get('/api/bookings');
        setBookingsData(response.data) ;
      } 
      catch (error) {
        console.log("Error Occured While Fetching Booked Data") ;
      }
  }
  BookedData() ; 
}, []) ;

  const handleApplyChanges = async(booking_id : string) =>{  
    if(!tempStatus[booking_id])return ;

    try {
      setApplyId(booking_id);
      await axios.patch(`/api/selectedbooking/${booking_id}` , {status : tempStatus[booking_id]}) ;
      onChangeStatus(tempSelected[booking_id] , tempStatus[booking_id]);
      alert("Status Changed") ;

      setBookingsData((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === booking_id ? { ...booking, status: tempStatus[booking_id] } : booking
        )
      );

      setTempStatus(prev => {
        const newMap = { ...prev } ;
        delete newMap[booking_id] ;
        return newMap ;
      })

      setTempSelected(prev =>{
        const newMap = { ...prev } ;
        delete newMap[booking_id];
        return newMap ;
      })
      
    } catch (error) {
      console.log(error , "error while Handling apply changes")
      alert("Status Change Issue")
    }

    finally{
      setApplyId("");
    }
  };

  const getStatusColor = (status: BookingStatus):string => {
    switch (status) {
      case BookingStatus.Confirmed:
        return "success";
      case BookingStatus.Pending:
        return "warning";
      case BookingStatus.Cancelled:
        return "error";
      case BookingStatus.Waiting:
        return "info";
      default:
        return "default";
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleStatusChange = async( currentBooking : Booking , status : BookingStatus) =>{
    const booking_id = currentBooking._id ;
    try{
      setTempStatus((prevBookings) =>({
        ...prevBookings,
        [booking_id] : status,
      }))

      setTempSelected((prev) =>({
        ...prev,
        [booking_id] : currentBooking ,
      }))

        handleMenuClose() ;
        
      } catch (error) {
        console.log("Error Occurred While Updating Booking status") ;
      }
    }
  

  const handleDeletebooking = async(booking: Booking) =>{
    try {
      const id = booking._id ; 
      console.log("selectedBooking:", booking);
      console.log(id) ;  
      await axios.delete(`/api/selectedbooking/${id}`) ;
      console.log(`Deleted Item `) ; 
      setBookingsData((prevBookings) => prevBookings.filter(book => book._id !== id)) ; 
    } catch (error) {
      console.log("Error Occurred While Deleting Booking") ;
    }
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Guest Name</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Total Guest</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Delete</TableCell>
              <TableCell>Apply Changes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookingsData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((booking) => (
                <TableRow key={booking._id} style={{backgroundColor: (!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status)) ?"white" :"rgb(156, 197, 74)"}}>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>9983583950</TableCell>
                  <TableCell>random@gmail.com</TableCell>
                  <TableCell>
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell> {booking.guests} </TableCell>
                  <TableCell>
                    <Chip
                      label={tempStatus[booking._id] || booking.status}
                      color={getStatusColor(tempStatus[booking._id] || booking.status) as any}
                      size="small"
                      onClick={(event) => handleMenuOpen(event, booking)}
                      style={{ cursor: "pointer" , borderRadius : '0%' }}
                    />
                  </TableCell>
                  <TableCell>${booking.totalAmount}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick = {() => {handleDeletebooking(booking) ,onDelete(booking)}}>
                      {isLoading ? <CircularProgress size={24} className="spinner" color="inherit" /> : <DeleteIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleApplyChanges(booking._id)} style={
                        { border: (!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status)) ? "1px solidrgb(43, 44, 41)" : "1px solid green", 
                          backgroundColor: (!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status)) ?"skyblue" :"green", 
                          color: "white", 
                        }
                      }
                        disabled={(!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status))}>
                        {applyId === booking._id ? <CircularProgress size={18} /> : "Apply"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={bookingsData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
       { <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() =>  {selectedBooking && handleStatusChange(selectedBooking , BookingStatus.Confirmed)}}>Confirmed</MenuItem>
        <MenuItem onClick={() =>  {selectedBooking && handleStatusChange(selectedBooking , BookingStatus.Pending) }}>Pending</MenuItem>
        <MenuItem onClick={() =>  {selectedBooking && handleStatusChange(selectedBooking , BookingStatus.Cancelled)}}>Cancelled</MenuItem>
        <MenuItem onClick={() =>  {selectedBooking && handleStatusChange(selectedBooking , BookingStatus.Waiting) }}>Waiting For Payment</MenuItem>
      </Menu> }
    </Paper>
  );
};

export default BookingsList;
