import { useEffect, useState } from 'react';
// STYLES MATERIAL-UI
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
import {
  getCalendarsEndpoint,
  getEventsEndpoint,
  ICalendar,
  IEvent,
} from './backend';
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
    tableLayout: 'fixed',
    '& td ~ td, & th ~ th': {
      borderLeft: '1px solid rgb(224,224,224)',
    },
    '& td': {
      verticalAlign: 'top',
      overflow: 'hidden',
      padding: '8px 4px',
    },
  },
  dayOfMonth: {
    fontWeight: 500,
    marginBottom: '4px',
  },
  eventButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    margin: '4px 0',
  },
  eventBackground: {
    display: 'inline-block',
    padding: '2px 4px',
    color: 'white',
    borderRadius: '4px',
  },
});

export default function CalendarScreen() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [calendars, setCalendars] = useState<ICalendar[]>([]);
  const [calendarsSelected, setCalendarsSelected] = useState<boolean[]>([]);

  const weeks = generateCalendar(
    getToday(),
    events,
    calendars,
    calendarsSelected
  );
  const classes = useStyles();
  const firstDate = weeks[0][0].date;
  const lastDate = weeks[weeks.length - 1][6].date;

  useEffect(() => {
    Promise.all([
      getCalendarsEndpoint(),
      getEventsEndpoint(firstDate, lastDate),
    ]).then(([calendars, events]) => {
      setCalendarsSelected(calendars.map(() => true));
      setCalendars(calendars);
      setEvents(events);
    });
  }, [firstDate, lastDate]);

  function toogleCalendar(index: number) {
    // Sempre faz uma cópia do array original. Nunca alterar o original
    const newArrayCalendarSelected = [...calendarsSelected];
    newArrayCalendarSelected[index] = !newArrayCalendarSelected[index];
    setCalendarsSelected(newArrayCalendarSelected);
  }

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
          {calendars.map((calendar, index) => {
            return (
              <div key={calendar.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      style={{ color: calendar.color }}
                      checked={calendarsSelected[index]}
                      onChange={() => toogleCalendar(index)}
                    />
                  }
                  label={calendar.name}
                />
              </div>
            );
          })}
        </Box>
      </Box>
      <Box flex="1" display="flex" flexDirection="column">
        <Box display="flex" alignItems="center" padding="8px 16px">
          <Box>
            <IconButton aria-label="Mês Anterior">
              <Icon>chevron_left</Icon>
            </IconButton>
            <IconButton aria-label="Mês Seguinte">
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

        <TableContainer style={{ flex: '1' }} component={'div'}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                {daysOfWeek.map(day => (
                  <TableCell key={day} align="center">
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, index) => {
                return (
                  <TableRow key={index}>
                    {week.map(cell => {
                      return (
                        <TableCell align="center" key={cell.date}>
                          <div className={classes.dayOfMonth}>
                            {cell.dayOfMonth}
                          </div>
                          {cell.events.map(event => {
                            const color = event.calendar.color;
                            return (
                              <button
                                key={event.id}
                                className={classes.eventButton}
                              >
                                {event.time && (
                                  <>
                                    <Icon style={{ color }} fontSize="inherit">
                                      watch_later
                                    </Icon>
                                    <Box component="span" margin="0 4px">
                                      {event.time}
                                    </Box>
                                  </>
                                )}
                                {event.time ? (
                                  <span>{event.desc}</span>
                                ) : (
                                  <span
                                    className={classes.eventBackground}
                                    style={{ background: color }}
                                  >
                                    {event.desc}
                                  </span>
                                )}
                              </button>
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
    </Box>
  );
}

type IEventWithCalendar = IEvent & { calendar: ICalendar };

interface ICalendarCell {
  date: string;
  dayOfMonth: number;
  events: IEventWithCalendar[];
}

function generateCalendar(
  date: string,
  allEvents: IEvent[],
  calendars: ICalendar[],
  calendarSelected: boolean[]
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

      const eventsOfCalendar: IEventWithCalendar[] = [];
      for (const event of allEvents) {
        if (event.date === isoDate) {
          const calendarIndex = calendars.findIndex(
            calendar => calendar.id === event.calendarId
          );
          if (calendarSelected[calendarIndex]) {
            eventsOfCalendar.push({
              ...event,
              calendar: calendars[calendarIndex],
            });
          }
        }
      }
      week.push({
        dayOfMonth: currentDay.getDate(),
        date: isoDate,

        events: eventsOfCalendar,
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    weeks.push(week);
  } while (currentDay.getMonth() === currentMonth);

  return weeks;
}

function getToday() {
  return '2021-05-17';
}
