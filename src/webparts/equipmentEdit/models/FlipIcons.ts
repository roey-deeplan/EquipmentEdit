import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
    customDatePicker: {
      '& .MuiSvgIcon-root': {
        transform: 'scaleX(-1)', // Flip icons horizontally
      },
    },
  }));