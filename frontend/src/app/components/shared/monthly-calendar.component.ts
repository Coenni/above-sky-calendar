import { Component, Input, Output, EventEmitter, signal, computed, TemplateRef, ContentChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

@Component({
  selector: 'app-monthly-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-calendar.component.html',
  styleUrls: ['./monthly-calendar.component.scss']
})
export class MonthlyCalendarComponent implements OnInit {
  @Input() currentDate: Date = new Date();
  @Input() dayContentTemplate?: TemplateRef<any>;
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() monthChanged = new EventEmitter<Date>();
  
  currentMonth = signal(new Date());
  
  // Week days
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Computed calendar days
  calendarDays = computed(() => {
    const month = this.currentMonth();
    const firstDay = startOfMonth(month);
    const lastDay = endOfMonth(month);
    const startDay = getDay(firstDay);
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    // Add leading empty days
    const leadingDays: CalendarDay[] = [];
    for (let i = 0; i < startDay; i++) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - (startDay - i));
      leadingDays.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        dayNumber: date.getDate()
      });
    }
    
    // Add days in month
    const monthDays: CalendarDay[] = daysInMonth.map(date => ({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      dayNumber: date.getDate()
    }));
    
    // Add trailing empty days to complete the grid
    const totalDays = leadingDays.length + monthDays.length;
    const trailingDaysCount = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    const trailingDays: CalendarDay[] = [];
    for (let i = 1; i <= trailingDaysCount; i++) {
      const date = new Date(lastDay);
      date.setDate(date.getDate() + i);
      trailingDays.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        dayNumber: date.getDate()
      });
    }
    
    return [...leadingDays, ...monthDays, ...trailingDays];
  });
  
  monthName = computed(() => {
    return format(this.currentMonth(), 'MMMM yyyy');
  });
  
  ngOnInit(): void {
    if (this.currentDate) {
      this.currentMonth.set(this.currentDate);
    }
  }
  
  previousMonth(): void {
    const newMonth = subMonths(this.currentMonth(), 1);
    this.currentMonth.set(newMonth);
    this.monthChanged.emit(newMonth);
  }
  
  nextMonth(): void {
    const newMonth = addMonths(this.currentMonth(), 1);
    this.currentMonth.set(newMonth);
    this.monthChanged.emit(newMonth);
  }
  
  onDateClick(day: CalendarDay): void {
    this.dateSelected.emit(day.date);
  }
}
