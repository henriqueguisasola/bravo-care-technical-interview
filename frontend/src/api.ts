import dayjs from "dayjs";
import { Shift } from "./models";
dayjs().format();

const url = "http://localhost:3001";

export const getShifts = async () => {
  const res = await fetch(`${url}/shifts`);
  const data = await res.json();
  return data.shifts.map((shift: any) => {
    const startTime = shift.start_time.split(":");
    const endTime = shift.end_time.split(":");
    const startDate = dayjs(shift.shift_date)
      .set("hour", startTime[0])
      .set("minute", startTime[1])
      .set("second", startTime[2])
      .format("h:mm A");
    const endDate = dayjs(shift.shift_date)
      .set("hour", endTime[0])
      .set("minute", endTime[1])
      .set("second", endTime[2])
      .format("h:mm A");

    return {
      ...shift,
      shift_date: dayjs(shift.shift_date).format("YYYY-MM-DD"),
      start_time: startDate,
      end_time: endDate,
    };
  }) as Shift[];
};

export const checkShifts = async (firstId: number, secondId: number) => {
  const res = await fetch(`${url}/check-shifts/${firstId}/${secondId}`);
  const data = await res.json();

  return {
    ...data,
  };
};

export const executeQ4Query = async () => {
  const res = await fetch(`${url}/execute-q4-query`);
  const data = await res.json();
  console.log(data);
};

export const executeQ5Query = async () => {
  const res = await fetch(`${url}/execute-q5-query`);
  const data = await res.json();
  console.log(data);
};

export const executeQ6Query = async () => {
  const res = await fetch(`${url}/execute-q6-query/Anne`);
  const data = await res.json();
  console.log(data);
};
