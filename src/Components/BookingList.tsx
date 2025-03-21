import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper, Table,TableBody, TableCell,TableContainer,TableHead,TableRow,TablePagination,Chip,IconButton,Menu,MenuItem,CircularProgress,Button,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import ImageModalComponent from './DeleteConfirmation'


export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
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
  createdAt: Date;
  guests: string;
  email : string ;
  phone : string ; 
}

interface BookingListProp {
  onChangeStats: () => void
}

const targetUrl = 'https://just-joy-backend.vercel.app';

const BookingsList: React.FC<BookingListProp> = ({ onChangeStats }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteBooking , setDeleteBooking] = useState<Booking | null>(null);
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);

  const [applyId, setApplyId] = useState<string>("");
  const [tempStatus, setTempStatus] = useState<Record<string, BookingStatus>>({});
  const [tempSelected, setTempSelected] = useState<Record<string, Booking>>({});

  const [open, setOpen] = useState(false);
  const [modalOpen , setModalOpen] = useState(false) ; 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  useEffect(() => {
    const BookedData = async () => {
      try {
        const response = await axios.get(`${targetUrl}/api/bookings`);
        setBookingsData(response.data);
      }
      catch (error) {
        alert("Error Occured While Fetching Booked Data")
      }
    }
    BookedData();
  }, []);

  const handleApplyChanges = async (booking_id: string) => {
    if (!tempStatus[booking_id]) return;
    try {
      setApplyId(booking_id);
      await axios.patch(`${targetUrl}/api/selectedbooking/${booking_id}`, { status: tempStatus[booking_id] });
      onChangeStats();

      setBookingsData((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === booking_id ? { ...booking, status: tempStatus[booking_id] } : booking
        )
      );

      setOpen(true) ; 

      setTempStatus(prev => {
        const newMap = { ...prev };
        delete newMap[booking_id];
        return newMap;
      })

      setTempSelected(prev => {
        const newMap = { ...prev };
        delete newMap[booking_id];
        return newMap;
      })

    } catch (error) {
      alert("Status Change Issue")
    }

    finally {
      setApplyId("");
    }
  };

  const getStatusColor = (status: BookingStatus): string => {
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

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    event
    setOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleStatusChange = async (currentBooking: Booking, status: BookingStatus) => {
    const booking_id = currentBooking._id;
    try {
      setTempStatus((prevBookings) => ({
        ...prevBookings,
        [booking_id]: status,
      }))

      setTempSelected((prev) => ({
        ...prev,
        [booking_id]: currentBooking,
      }))

      handleMenuClose();

    } catch (error) {
      alert("Error Occurred While Updating Booking status");
    }
  }


  const handleDeletebooking = async (booking: Booking) => {
    try {
      const id = booking._id;

      await axios.delete(`${targetUrl}/api/selectedbooking/${id}`);
      setBookingsData((prevBookings) => prevBookings.filter(book => book._id !== id));

      onChangeStats();
      setModalOpen(false)
      setOpen(true) ; 
    }
    catch (error) {
      alert("Error Occurred While Deleting Booking");
    }
  }

  const invalidSelection = (bookingid : string , bookingstatus : string) => {
    return !(tempSelected[bookingid]) || (tempStatus[bookingid] === bookingstatus) ? true : false;
  }

  const ApplyStyle = (bookingid : string , bookingstatus : string) =>{ 
    return (invalidSelection(bookingid , bookingstatus))?
        {
          border: "1px solidrgb(43, 44, 41)" ,
          backgroundColor: "skyblue" ,
          color: "white",
        }
      : {
          border: "1px solid green",
          backgroundColor: "green",
          color: "white",
        }
  }
  
  const SelectionStyle = (bookingid : string , bookingstatus : string) =>{ 
    return (invalidSelection(bookingid , bookingstatus))?
        {
          backgroundColor: "White" ,
        }
      : {
          backgroundColor: "rgb(156, 197, 74)",
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
                <TableRow key={booking._id} style={ SelectionStyle(booking._id , booking.status) }>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{booking.phone}</TableCell>
                  <TableCell>{booking.email}</TableCell>
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
                      style={{ cursor: "pointer", borderRadius: '0%' }}
                    />
                  </TableCell>

                  <TableCell>${booking.totalAmount}</TableCell>

                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => {setDeleteBooking(booking) ,setModalOpen(true)}}>
                      {<DeleteIcon />}
                    </IconButton>
                  </TableCell>

                  <TableCell>
                    <Button onClick={() => 
                        handleApplyChanges(booking._id)} 
                        style={ApplyStyle(booking._id , booking.status)}
                        disabled={(invalidSelection(booking._id , booking.status))}>
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
      {modalOpen && <ImageModalComponent onClose={() => setModalOpen(false)} onDelete = {() =>  {deleteBooking && handleDeletebooking(deleteBooking)}}/>}
        
      {<Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { selectedBooking && handleStatusChange(selectedBooking, BookingStatus.Confirmed) }}>Confirmed</MenuItem>
        <MenuItem onClick={() => { selectedBooking && handleStatusChange(selectedBooking, BookingStatus.Pending) }}>Pending</MenuItem>
        <MenuItem onClick={() => { selectedBooking && handleStatusChange(selectedBooking, BookingStatus.Cancelled) }}>Cancelled</MenuItem>
        <MenuItem onClick={() => { selectedBooking && handleStatusChange(selectedBooking, BookingStatus.Waiting) }}>Waiting For Payment</MenuItem>
      </Menu>}

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Changes Applied Successfully
        </Alert>
      </Snackbar>

    </Paper>
    
  );
};

export default BookingsList;
