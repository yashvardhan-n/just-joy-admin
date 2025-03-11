import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper, Table,TableBody, TableCell,TableContainer,TableHead,TableRow,TablePagination,Chip,IconButton,Menu,MenuItem,CircularProgress,Button,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";


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

const BookingsList: React.FC<BookingListProp> = ({ onChangeStats }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);

  const [applyId, setApplyId] = useState<string>("");
  const [tempStatus, setTempStatus] = useState<Record<string, BookingStatus>>({});
  const [tempSelected, setTempSelected] = useState<Record<string, Booking>>({});
  const [open, setOpen] = useState(false);

  

  useEffect(() => {
    const BookedData = async () => {
      try {
        const response = await axios.get('/api/bookings');
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
      await axios.patch(`/api/selectedbooking/${booking_id}`, { status: tempStatus[booking_id] });
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
      setIsLoading(true);
      const id = booking._id;
      await axios.delete(`/api/selectedbooking/${id}`);
      setBookingsData((prevBookings) => prevBookings.filter(book => book._id !== id));
      onChangeStats();
      alert("Booking Deleted")
    }
    catch (error) {
      alert("Error Occurred While Deleting Booking");
    }
    finally {
      setIsLoading(false);
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
                <TableRow key={booking._id} style={{ backgroundColor: (!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status)) ? "white" : "rgb(156, 197, 74)" }}>
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
                    <IconButton size="small" color="error" onClick={() => { handleDeletebooking(booking) }}>
                      {isLoading ? <CircularProgress size={24} className="spinner" color="inherit" /> : <DeleteIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleApplyChanges(booking._id)} style={
                      {
                        border: (!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status)) ? "1px solidrgb(43, 44, 41)" : "1px solid green",
                        backgroundColor: (!(tempSelected[booking._id]) || (tempStatus[booking._id] === booking.status)) ? "skyblue" : "green",
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
          Status Changed Successfully .
        </Alert>
      </Snackbar>

    </Paper>
    
  );
};

export default BookingsList;
