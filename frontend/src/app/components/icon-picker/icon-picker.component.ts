import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Curated emoji collections for different categories
const EMOJI_CATEGORIES = {
  tasks: ['🧹', '📚', '🎨', '🏃', '🎯', '✏️', '📝', '🔧', '💪', '🎵', '🏠', '🌟', '⭐', '✨'],
  events: ['🎂', '🏫', '⚽', '🎭', '🎪', '🎨', '🏃', '🎸', '🎮', '🎬', '🎤', '🏆', '🎓', '👨‍👩‍👧‍👦'],
  meals: ['🍕', '🥗', '🍰', '🍔', '🌮', '🍜', '🍝', '🥘', '🍱', '🥙', '🍞', '🧀', '🥚', '🍳'],
  rewards: ['🍦', '🎮', '🎬', '🎨', '🎯', '🏆', '🎁', '🌟', '⭐', '💎', '🏅', '🎪', '🎭', '🎸'],
  lists: ['🛒', '✈️', '🎒', '📋', '✅', '📝', '🎯', '🏠', '🌟', '💼', '🎨', '📚', '🎁', '🏖️'],
  favorites: ['❤️', '⭐', '🌟', '✨', '💯', '🔥', '👍', '😊', '🎉', '🎊'],
  all: ['😀', '😊', '🥳', '🎉', '❤️', '⭐', '🌟', '✨', '🎯', '🏆', '🎨', '📚', '🎮', '⚽', 
        '🍕', '🍰', '🎂', '🎁', '🏠', '🌈', '🔥', '💯', '👍', '✅', '📝', '🛒', '✈️', '🎒',
        '🧹', '🏃', '💪', '🎵', '🎬', '🎸', '🎭', '🎪', '🎓', '🏅', '💎', '🌺', '🌻', '🌸']
};

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent {
  @Input() selectedIcon?: string;
  @Input() category: 'tasks' | 'events' | 'meals' | 'rewards' | 'lists' | 'all' = 'all';
  @Output() iconSelected = new EventEmitter<string>();

  isOpen = false;
  searchTerm = '';
  categories = EMOJI_CATEGORIES;
  
  get displayedEmojis(): string[] {
    let emojis = this.categories[this.category] || this.categories.all;
    
    // Note: Full search implementation would require emoji name/keyword data
    // For now, filtering is disabled until emoji metadata is available
    return emojis;
  }

  togglePicker(): void {
    this.isOpen = !this.isOpen;
  }

  selectIcon(emoji: string): void {
    this.selectedIcon = emoji || undefined;
    this.iconSelected.emit(emoji);
    this.isOpen = false;
  }

  closePicker(): void {
    this.isOpen = false;
  }
}
