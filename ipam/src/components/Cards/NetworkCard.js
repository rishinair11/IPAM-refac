import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

class NetworkCard extends Component{
    render() { 
        return (
            <Card>
                <CardContent>  
                    <Typography>
                        192.168.0.0
                    </Typography>
                </CardContent>
            </Card>
        )
    }
}

export default NetworkCard;