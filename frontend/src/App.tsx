import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import {
  checkShifts,
  executeQ4Query,
  executeQ5Query,
  executeQ6Query,
  getShifts,
} from "./api";
import dayjs from "dayjs";
import { Shift } from "./models";
dayjs().format();

export default function App() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [overlapInfo, setOverlapInfo] = useState<any>({
    overlapMinutes: "-",
    maximumOverlapThreshold: "-",
    exceedsOverlapThreshold: false,
  });
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getShifts();
      setShifts(data);
    };

    fetchData();
  }, []);

  const checkSelectedShifts = async () => {
    if (selectedShifts.length === 2) {
      const data = await checkShifts(selectedShifts[0], selectedShifts[1]);
      setOverlapInfo(data);
    } else {
      setErrorMessage("You need to select 2 shifts before submitting!");
    }
  };

  const selectShift = (id: number) => () => {
    if (selectedShifts.includes(id)) {
      setSelectedShifts((prevShifts) => {
        const newShifts = [...prevShifts];
        const index = newShifts.indexOf(id);
        if (index > -1) {
          newShifts.splice(index, 1);
        }
        return newShifts;
      });
    } else if (selectedShifts.length < 2) {
      setSelectedShifts([...selectedShifts, id]);
    }
  };

  const handleClose = () => {
    setErrorMessage("");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bravo Care Technical Interview
        </Typography>
        <Card sx={{ minWidth: 275, marginBottom: 1 }}>
          <Grid container>
            <Grid item xs={9}>
              <CardContent>
                <Typography variant={"body1"}>
                  Overlap Minutes: {overlapInfo.overlapMinutes}
                </Typography>
                <Typography variant={"body1"}>
                  Max Overlap Threshold: {overlapInfo.maximumOverlapThreshold}
                </Typography>
                <Typography variant={"body1"}>
                  Exceeds Overlap Threshold:{" "}
                  {overlapInfo.exceedsOverlapThreshold ? "True" : "False"}
                </Typography>
              </CardContent>
            </Grid>
            <Grid
              item
              xs={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Button sx={{ width: "100%" }} onClick={checkSelectedShifts}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Card>
        <Grid container spacing={1}>
          {shifts.map((shift) => (
            <Grid item xs={4}>
              <Card
                onClick={selectShift(shift.shift_id)}
                sx={{
                  cursor: "pointer",
                  bgcolor: selectedShifts.includes(shift.shift_id)
                    ? "#72a9da"
                    : undefined,
                }}
                variant={
                  selectedShifts.includes(shift.shift_id)
                    ? "outlined"
                    : "elevation"
                }
              >
                <CardContent>
                  <Typography variant={"body1"} align={"center"}>
                    {shift.facility_name}
                  </Typography>
                  <Typography variant={"body1"} align={"center"}>
                    {shift.shift_date}
                  </Typography>
                  <Typography variant={"body1"} align={"center"}>
                    {shift.start_time} - {shift.end_time}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ marginY: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              sx={{ width: "100%" }}
              variant="contained"
              onClick={executeQ4Query}
            >
              Execute Q4 Query
            </Button>
          </Grid>
          <Grid item xs={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              sx={{ width: "100%" }}
              variant="contained"
              onClick={executeQ5Query}
            >
              Execute Q5 Query
            </Button>
          </Grid>
          <Grid item xs={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              sx={{ width: "100%" }}
              variant="contained"
              onClick={executeQ6Query}
            >
              Execute Q6 Query
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
