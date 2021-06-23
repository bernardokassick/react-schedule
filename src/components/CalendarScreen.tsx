import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// TABLES
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// BACKEND
import { getEventsEndpoint, IEvent } from './backend';

// BUTTON
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

// CHECKBOX
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

//ICONS
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';

const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

const useStyles = makeStyles({
  table: {
    borderTop: '1px solid rgb(224,224,224)',
    minHeight: '100%',
    '& td ~ td, & th ~ th': {
      borderLeft: '1px solid rgb(224,224,224)',
    },
  },
});

export default function CalendarScreen() {
  const [events, setEvents] = useState<IEvent[]>([]);

  const classes = useStyles();
  const weeks = generateCalendar(getToday(), events);
  const firstDate = weeks[0][0].date;
  const lastDate = weeks[weeks.length - 1][6].date;

  useEffect(() => {
    getEventsEndpoint(firstDate, lastDate).then(setEvents);
  }, [firstDate, lastDate]);

  return (
    <Box display="flex" height="100%" alignItems="stretch">
      <Box
        borderRight="1px solid rgb(224,224,224)"
        width="16em"
        padding="8px 16px"
      >
        <h2>Agenda React</h2>

        <Button variant="contained" color="primary">
          Novo Evento
        </Button>
        <Box marginTop="64px">
          <h3>Agendas:</h3>
          <FormControlLabel
            control={<Checkbox name="checkedA" />}
            label="Bernardo"
          />
          <FormControlLabel
            control={<Checkbox name="checkedB" />}
            label="Others"
          />
        </Box>
      </Box>
      <TableContainer component={'div'}>
        <Box display="flex" alignItems="center" padding="8px 16px">
          <Box>
            <IconButton aria-label="Anteior">
              <Icon>chevron_left</Icon>
            </IconButton>
            <IconButton aria-label="Próximo">
              <Icon>chevron_right</Icon>
            </IconButton>
          </Box>
          <Box flex="1" padding="16px" component="h3">
            Junho 2021
          </Box>
          <IconButton aria-label="Usuário">
            <Avatar>
              <Icon>person</Icon>
            </Avatar>
          </IconButton>
        </Box>
        <Table className={classes.table} aria-label="a dense table">
          <TableHead>
            <TableRow>
              {daysOfWeek.map((day) => (
                <TableCell align="center">{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weeks.map((week, index) => {
              return (
                <TableRow key={index}>
                  {week.map((cell) => {
                    return (
                      <TableCell align="center" key={cell.date}>
                        {cell.date}
                        {cell.events.map((event) => {
                          return (
                            <div>
                              {event.time || ''} {event.desc}
                            </div>
                          );
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

interface ICalendarCell {
  date: string;
  events: IEvent[];
}

function generateCalendar(
  date: string,
  allEvents: IEvent[]
): ICalendarCell[][] {
  const weeks: ICalendarCell[][] = [];
  const jsDate = new Date(date + 'T12:00:00');
  const currentMonth = jsDate.getMonth();

  const currentDay = new Date(jsDate.valueOf());
  currentDay.setDate(1);
  const dayOfWeek = currentDay.getDay();
  currentDay.setDate(1 - dayOfWeek);

  do {
    const week: ICalendarCell[] = [];
    for (let i = 0; i < daysOfWeek.length; i++) {
      const currentMonthString = (currentDay.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const currentDayString = currentDay.getDate().toString().padStart(2, '0');
      const isoDate = `${currentDay.getFullYear()}-${currentMonthString}-${currentDayString}`;
      week.push({
        date: isoDate,
        events: allEvents.filter((event) => event.date === isoDate),
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    weeks.push(week);
  } while (currentDay.getMonth() === currentMonth);

  return weeks;
}

function getToday() {
  return '2021-06-17';
}
