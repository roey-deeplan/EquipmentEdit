import { withStyles } from '@material-ui/core/styles';
import {
    TableCell, MenuItem, Switch, Tooltip
} from '@material-ui/core';

// Custom components styles

// Custom TableHead style
export const CustomTableCell = withStyles(theme => ({
    root: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
}))(TableCell);

// Custom Green MenuItem  style
export const CustomGreenMenuItem = withStyles(theme => ({
    root: {

    },
    selected: {
        '&.Mui-selected': {
            backgroundColor: "#8DD095",
            color: "Black",
            fontWeight: 600
        }
    }
}))(MenuItem);

// Custom Yellow MenuItem  style
export const CustomYellowMenuItem = withStyles(theme => ({
    root: {

    },
    selected: {
        '&.Mui-selected': {
            backgroundColor: "#F7EEA6",
            color: "Black",
            fontWeight: 600
        }
    }
}))(MenuItem);

// Custom Red MenuItem  style
export const CustomRedMenuItem = withStyles(theme => ({
    root: {

    },
    selected: {
        '&.Mui-selected': {
            backgroundColor: "#ED8181",
            color: "Black",
            fontWeight: 600
        }
    }
}))(MenuItem);

// Custom Switch style
export const CustomSwitch = withStyles(theme => ({
    switchBase: {
        "&$checked": {
            // The rules above override the default rules for graying 
            // out the thumb and track when the switch is disabled,
            // so we have to add that back in ourselves
            "&$disabled": {
                // gray out the thumb
                color: "#03787C",
                "& + $track": {
                    // gray out the track
                    backgroundColor: "#000"
                }
            }
        },
    },
    checked: {},
    track: {
        backgroundColor: "#000"
    },
    disabled: {}
}))(Switch);

// Custom Tooltip style
export const CustomToolTip = withStyles(theme => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 14,
    },
}))(Tooltip);