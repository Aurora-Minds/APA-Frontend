import { useNotifications } from '../context/NotificationContext';
import { User } from '../types';

// API base URL - you'll need to import this from your config
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Task {
  _id: string;
  title: string;
  dueDate?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheckedTasks: Set<string> = new Set();
  private lastUserLevel: number = 1;
  private currentUserId: string | null = null;
  private authToken: string | null = null;

  startMonitoring() {
    // Check for notifications every minute
    this.checkInterval = setInterval(() => {
      this.checkTaskDueDates();
    }, 60000); // 1 minute
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkTaskDueDates() {
    // This will be called by components that have access to tasks and notifications
    // The actual implementation will be in the components that use this service
  }

  // Set current user and reset tracking for new user
  setCurrentUser(userId: string, token?: string) {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.authToken = token || null;
      this.lastCheckedTasks.clear();
      this.lastUserLevel = 1;
    }
  }

  checkTaskDueDate(task: Task, addNotification: (notification: any) => void) {
    if (!task.dueDate || task.status === 'completed') return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Debug logging
    console.log(`Checking task: ${task.title}`);
    console.log(`Due date: ${dueDate}`);
    console.log(`Current time: ${now}`);
    console.log(`Hours until due: ${hoursDiff}`);
    console.log(`Already checked: ${this.lastCheckedTasks.has(task._id)}`);

    // Check if task is due in approximately 1 hour
    // For newly created tasks, check if they're due within 1 hour
    const isNewTask = !this.lastCheckedTasks.has(task._id);
    
    // More lenient window for new tasks (0.5 to 1.2 hours)
    // For existing tasks, check every minute if they're due within 1 hour (0.8 to 1.2 hours)
    const minHours = isNewTask ? 0.5 : 0.8;
    const maxHours = 1.2;
    
    if (hoursDiff >= minHours && hoursDiff <= maxHours && !this.lastCheckedTasks.has(task._id)) {
      console.log(`Triggering notification for task: ${task.title} (due in ${hoursDiff.toFixed(2)} hours)`);
      addNotification({
        type: 'task_due',
        title: 'Task Due Soon!',
        message: `"${task.title}" is due in about 1 hour`,
        taskId: task._id,
      });
      this.lastCheckedTasks.add(task._id);
    } else if (hoursDiff >= 0.8 && hoursDiff <= 1.2) {
      console.log(`Task ${task.title} is due in ~1 hour but already checked`);
    } else {
      console.log(`Task ${task.title} is due in ${hoursDiff.toFixed(2)} hours - not in notification window (${minHours}-${maxHours})`);
    }
  }

  checkLevelUp(user: User, addNotification: (notification: any) => void) {
    // Calculate current level from XP
    let currentLevel = 1;
    let xpForLevel = 100;
    let xpInLevel = user.xp || 0;
    
    while (xpInLevel >= xpForLevel) {
      xpInLevel -= xpForLevel;
      currentLevel++;
      xpForLevel = 100 * currentLevel;
    }
    
    console.log(`Checking level up - User XP: ${user.xp}, Current Level: ${currentLevel}, Last Level: ${this.lastUserLevel}`);
    
    if (currentLevel > this.lastUserLevel) {
      console.log(`Level up detected! From ${this.lastUserLevel} to ${currentLevel}`);
      addNotification({
        type: 'level_up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You've reached level ${currentLevel}!`,
        level: currentLevel,
      });
      this.lastUserLevel = currentLevel;
    }
  }

  addTaskCompletedNotification(task: Task, addNotification: (notification: any) => void) {
    addNotification({
      type: 'task_completed',
      title: 'Task Completed! ✅',
      message: `Great job! You've completed "${task.title}"`,
      taskId: task._id,
    });
  }

  resetTaskChecks() {
    this.lastCheckedTasks.clear();
  }

  // Add a new task to be checked (for newly created tasks)
  addNewTask(taskId: string) {
    // Don't add to lastCheckedTasks so it gets checked immediately
    console.log(`New task added for notification checking: ${taskId}`);
  }

  // Check backend for notifications
  async checkBackendNotifications(addNotification: (notification: any) => void) {
    if (!this.authToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/notifications`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const notifications = await response.json();
        notifications.forEach((notification: any) => {
          if (!this.lastCheckedTasks.has(notification.taskId)) {
            console.log(`Backend notification for task: ${notification.title}`);
            addNotification({
              type: 'task_due',
              title: 'Task Due Soon!',
              message: notification.message,
              taskId: notification.taskId,
            });
            this.lastCheckedTasks.add(notification.taskId);
          }
        });
      }
    } catch (error) {
      console.error('Error checking backend notifications:', error);
    }
  }

  // Clear all tracking when user logs out
  clearUserData() {
    this.currentUserId = null;
    this.lastCheckedTasks.clear();
    this.lastUserLevel = 1;
  }
}

export const notificationService = new NotificationService(); 