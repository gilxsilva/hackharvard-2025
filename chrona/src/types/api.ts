// Canvas LMS API Response Types

export interface CanvasCourse {
  id: number;
  name: string;
  course_code?: string;
  account_id: number;
  start_at?: string;
  end_at?: string;
  public_syllabus?: boolean;
  public_syllabus_to_auth?: boolean;
  storage_quota_mb?: number;
  is_public?: boolean;
  is_public_to_auth_users?: boolean;
  apply_assignment_group_weights?: boolean;
  calendar?: {
    ics?: string;
  };
  default_view?: string;
  syllabus_body?: string;
  syllabus_course_summary?: boolean;
  term?: {
    id: number;
    name: string;
    start_at: string;
    end_at: string;
  };
  course_progress?: {
    requirement_count: number;
    requirement_completed_count: number;
    next_requirement_url?: string;
    completed_at?: string;
  };
  enrollments?: CanvasEnrollment[];
  total_students?: number;
  teachers?: CanvasUser[];
  workflow_state: 'unpublished' | 'available' | 'completed' | 'deleted';
  restrict_enrollments_to_course_dates?: boolean;
}

export interface CanvasEnrollment {
  id: number;
  course_id: number;
  sis_course_id?: string;
  course_integration_id?: string;
  course_section_id: number;
  section_integration_id?: string;
  sis_account_id?: string;
  sis_section_id?: string;
  sis_user_id?: string;
  enrollment_state: 'active' | 'invited' | 'creation_pending' | 'deleted' | 'rejected' | 'completed' | 'inactive';
  limit_privileges_to_course_section: boolean;
  sis_import_id?: number;
  root_account_id: number;
  type: 'StudentEnrollment' | 'TeacherEnrollment' | 'TaEnrollment' | 'DesignerEnrollment' | 'ObserverEnrollment';
  user_id: number;
  associated_user_id?: number;
  role: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  start_at?: string;
  end_at?: string;
  last_activity_at?: string;
  last_attended_at?: string;
  total_activity_time?: number;
  html_url: string;
  grades?: {
    html_url: string;
    current_grade?: string;
    current_score?: number;
    final_grade?: string;
    final_score?: number;
  };
  user?: CanvasUser;
  override_grade?: string;
  override_score?: number;
  unposted_current_score?: number;
  unposted_final_score?: number;
  unposted_current_grade?: string;
  unposted_final_grade?: string;
  has_grading_periods?: boolean;
  totals_for_all_grading_periods_option?: boolean;
  current_grading_period_title?: string;
  current_grading_period_id?: number;
}

export interface CanvasUser {
  id: number;
  name: string;
  sortable_name?: string;
  last_name?: string;
  first_name?: string;
  short_name?: string;
  sis_user_id?: string;
  sis_import_id?: number;
  integration_id?: string;
  login_id?: string;
  avatar_url?: string;
  avatar_state?: 'approved' | 'locked' | 'submitted' | 'rejected' | 'none' | 'pending';
  enrollments?: CanvasEnrollment[];
  email?: string;
  locale?: string;
  last_login?: string;
  time_zone?: string;
  bio?: string;
}

// Canvas Assignment interface
export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  due_at: string | null;
  unlock_at?: string | null;
  lock_at?: string | null;
  points_possible: number | null;
  grading_type: string;
  assignment_group_id: number;
  grading_standard_id?: number | null;
  created_at: string;
  updated_at: string;
  peer_reviews: boolean;
  automatic_peer_reviews: boolean;
  position: number;
  grade_group_students_individually: boolean;
  anonymous_peer_reviews: boolean;
  group_category_id?: number | null;
  post_to_sis: boolean;
  moderated_grading: boolean;
  omit_from_final_grade: boolean;
  intra_group_peer_reviews: boolean;
  anonymous_instructor_annotations: boolean;
  anonymous_grading: boolean;
  graders_anonymous_to_graders: boolean;
  grader_count: number;
  grader_comments_visible_to_graders: boolean;
  final_grader_id?: number | null;
  grader_names_visible_to_final_grader: boolean;
  allowed_attempts: number;
  annotatable_attachment_id?: number | null;
  hide_in_gradebook: boolean;
  secure_params?: string;
  lti_context_id?: string;
  course_id: number;
  html_url: string;
  has_submitted_submissions: boolean;
  course_name?: string;
}export interface CanvasAssignmentDate {
  id?: number;
  base?: boolean;
  title?: string;
  due_at?: string;
  unlock_at?: string;
  lock_at?: string;
  student_ids?: number[];
}

export interface CanvasSubmission {
  assignment_id: number;
  assignment: CanvasAssignment;
  course: CanvasCourse;
  attempt?: number;
  body?: string;
  grade?: string;
  grade_matches_current_submission: boolean;
  html_url: string;
  preview_url: string;
  score?: number;
  submission_comments?: CanvasSubmissionComment[];
  submission_type?: 'online_text_entry' | 'online_url' | 'online_upload' | 'media_recording' | null;
  submitted_at?: string;
  url?: string;
  user_id: number;
  grader_id?: number;
  graded_at?: string;
  user: CanvasUser;
  late: boolean;
  assignment_visible: boolean;
  excused?: boolean;
  missing: boolean;
  late_policy_status?: 'missing' | 'late' | 'extended' | 'none';
  points_deducted?: number;
  seconds_late?: number;
  workflow_state: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  extra_attempts?: number;
  anonymous_id?: string;
  posted_at?: string;
  read_status?: 'read' | 'unread';
  redo_request?: boolean;
}

export interface CanvasSubmissionComment {
  id: number;
  author_id: number;
  author_name: string;
  author: CanvasUser;
  comment: string;
  created_at: string;
  edited_at?: string;
  media_comment?: {
    content_type: string;
    display_name: string;
    media_id: string;
    media_type: string;
    url: string;
  };
  attachments?: CanvasFile[];
}

export interface CanvasFile {
  id: number;
  uuid: string;
  folder_id: number;
  display_name: string;
  filename: string;
  content_type: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  unlock_at?: string;
  locked: boolean;
  hidden: boolean;
  lock_at?: string;
  hidden_for_user: boolean;
  thumbnail_url?: string;
  modified_at: string;
  mime_class: string;
  media_entry_id?: string;
  locked_for_user: boolean;
  lock_info?: Record<string, unknown>;
  lock_explanation?: string;
  preview_url?: string;
}

export interface CanvasRubric {
  id: number;
  title: string;
  context_id: number;
  context_type: string;
  points_possible: number;
  reusable: boolean;
  read_only: boolean;
  free_form_criterion_comments: boolean;
  hide_score_total: boolean;
  data: CanvasRubricCriterion[];
  assessments?: CanvasRubricAssessment[];
  associations?: CanvasRubricAssociation[];
}

export interface CanvasRubricCriterion {
  id: string;
  description: string;
  long_description?: string;
  points: number;
  criterion_use_range?: boolean;
  ratings: CanvasRubricRating[];
}

export interface CanvasRubricRating {
  id: string;
  description: string;
  long_description?: string;
  points: number;
  criterion_id: string;
}

export interface CanvasRubricAssessment {
  id: number;
  rubric_id: number;
  rubric_association_id: number;
  score: number;
  data: CanvasRubricAssessmentData[];
  comments?: string;
  artifact_type: string;
  artifact_id: number;
  artifact_attempt?: number;
  assessment_type: string;
  assessor_id: number;
}

export interface CanvasRubricAssessmentData {
  criterion_id: string;
  points: number;
  rating_id?: string;
  comments?: string;
  description?: string;
}

export interface CanvasRubricAssociation {
  id: number;
  rubric_id: number;
  association_id: number;
  association_type: string;
  use_for_grading: boolean;
  summary_data?: Record<string, unknown>;
  purpose: string;
  hide_score_total: boolean;
  hide_points: boolean;
  hide_outcome_results: boolean;
}

export interface CanvasAssignmentOverride {
  id: number;
  assignment_id: number;
  student_ids?: number[];
  group_id?: number;
  course_section_id?: number;
  title: string;
  due_at?: string;
  unlock_at?: string;
  lock_at?: string;
  all_day?: boolean;
  all_day_date?: string;
}

export interface CanvasGrade {
  assignment: CanvasAssignment;
  submission: CanvasSubmission;
  course_code?: string;
}

export interface CanvasCourseGrade {
  course_code?: string;
  course_name?: string;
  current_grade?: string;
  current_score?: number;
  final_grade?: string;
  final_score?: number;
}

// Google Calendar API Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
  recurrence?: string[];
  recurringEventId?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  transparency?: 'opaque' | 'transparent';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  htmlLink: string;
  created: string;
  updated: string;
  etag: string;
}

// Widget Types
export interface WidgetProps {
  id: string;
  title: string;
  isVisible?: boolean;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onToggleVisibility?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Layout Types
export interface LayoutBounds {
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Gemini API Types (from existing geminiApi.ts)
export interface SyllabusEvent {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type?: string;
}

export interface CourseInfo {
  courseName?: string;
  courseCode?: string;
  instructor?: string;
  location?: string;
  schedule?: string;
}

export interface SyllabusParseResult {
  courseInfo: CourseInfo;
  events: SyllabusEvent[];
}