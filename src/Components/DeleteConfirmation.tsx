import { useState } from 'react';
import './DeleteConfirmation.css';
import { CircularProgress } from '@mui/material';
interface ImageModalComponentProps {
    onClose: () => void;
    onDelete : () => void ; 
  }
  
  const ImageModalComponent: React.FC<ImageModalComponentProps> = ({
    onClose,
    onDelete ,
  }) => {
    const [isLoading , setIsLoading] = useState(false) ; 
    const disabledStyle = isLoading ? {backgroundColor : "skyblue" , cursor : "default"} : {backgroundColor : "#1971c2" , cursor : "pointer"} ;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="heading">
            <h3>Are You Sure ?</h3>
          </div>
          <div className="description">
            Do you really want to delete this Booking ? This Process cannot be undone. 
          </div>
          <div className="action-btn">
            <button className="close-btn" onClick={onClose} disabled = {isLoading} style={disabledStyle}>
              Cancel
            </button>
            <button className="delete-btn" onClick={() => { setIsLoading(true) , onDelete()}}>
              {isLoading ? <CircularProgress size={24} className="spinner" color= "inherit" /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ImageModalComponent;
  