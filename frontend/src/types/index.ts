export interface ColumnSchema {
  name: string;
  dtype: string;
  inferred_type: "numeric" | "categorical" | "datetime" | "text" | "boolean";
  sample_values: any[];
  null_count: number;
  null_percentage: number;
}

export interface DatasetMeta {
  id: string;
  name: string;
  original_filename: string;
  file_format: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  columns: string[];
  created_at: string;
  updated_at?: string;
  is_demo: boolean;
}

export interface DatasetPreviewResponse {
  metadata: DatasetMeta;
  columns: ColumnSchema[];
  preview_rows: Record<string, any>[];
}

export interface QualityIssue {
  severity: "error" | "warning";
  category: string;
  column?: string;
  description: string;
  affected_count: number;
  affected_percentage: number;
}

export interface NumericColumnProfile {
  count: number;
  missing_count: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  q25?: number;
  q75?: number;
  iqr?: number;
  outlier_count: number;
  lower_bound?: number;
  upper_bound?: number;
}

export interface CategoricalColumnProfile {
  unique_count: number;
  missing_count: number;
  cardinality: number;
  top_values: { value: any; count: number; percentage: number }[];
}

export interface DatetimeColumnProfile {
  valid_count: number;
  missing_count: number;
  min_date?: string;
  max_date?: string;
}

export interface TextColumnProfile {
  empty_strings_count: number;
  avg_length: number;
  distinct_count: number;
}

export interface ColumnProfile {
  name: string;
  dtype: string;
  category: "numeric" | "categorical" | "datetime" | "text" | "boolean";
  numeric_stats?: NumericColumnProfile;
  categorical_stats?: CategoricalColumnProfile;
  datetime_stats?: DatetimeColumnProfile;
  text_stats?: TextColumnProfile;
}

export interface DatasetProfileResponse {
  dataset_id: string;
  total_rows: number;
  total_columns: number;
  total_cells: number;
  memory_usage_kb: number;
  duplicate_rows_count: number;
  duplicate_rows_percentage: number;
  missing_cells_count: number;
  missing_cells_percentage: number;
  numeric_columns_count: number;
  categorical_columns_count: number;
  datetime_columns_count: number;
  text_columns_count: number;
  columns: Record<string, ColumnProfile>;
  quality_issues: QualityIssue[];
  quality_score: number;
}

export interface ColumnFilter {
  column: string;
  operator: string;
  value?: any;
}

export interface QueryRequest {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  filters?: ColumnFilter[];
  columns?: string[];
}

export interface QueryResponse {
  dataset_id: string;
  total_rows: number;
  filtered_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
  columns: ColumnSchema[];
  rows: Record<string, any>[];
}

export interface TransformationStep {
  operation: string;
  parameters: Record<string, any>;
  description?: string;
}

export interface TransformationPreviewResponse {
  operation: string;
  original_rows: number;
  original_cols: number;
  preview_rows: number;
  preview_cols: number;
  affected_rows_count: number;
  sample_before: Record<string, any>[];
  sample_after: Record<string, any>[];
}

export interface TransformationHistoryItem {
  id: string;
  dataset_id: string;
  operation: string;
  parameters: Record<string, any>;
  description: string;
  timestamp: string;
  rows_before: number;
  rows_after: number;
  cols_before: number;
  cols_after: number;
}

export interface ChartConfigRequest {
  chart_type: string;
  x_column?: string;
  y_column?: string;
  group_by?: string;
  color_column?: string;
  aggregation?: string;
  title?: string;
}

export interface ChartRecommendation {
  id: string;
  title: string;
  description: string;
  chart_type: string;
  config: ChartConfigRequest;
}

export interface ChartResponse {
  title: string;
  chart_type: string;
  plotly_data: any[];
  plotly_layout: Record<string, any>;
  point_count: number;
  note?: string;
}

export interface DescriptiveStatsItem {
  column: string;
  count: number;
  mean?: number;
  median?: number;
  mode?: any;
  std?: number;
  variance?: number;
  min?: number;
  q25?: number;
  q75?: number;
  max?: number;
  skewness?: number;
  kurtosis?: number;
}

export interface CorrelationPair {
  column_x: string;
  column_y: string;
  pearson_r: number;
  spearman_rho?: number;
  relationship: string;
}

export interface CorrelationResponse {
  columns: string[];
  pearson_matrix: (number | null)[][];
  spearman_matrix?: (number | null)[][];
  top_correlations: CorrelationPair[];
  caution_note: string;
}

export interface OutlierReport {
  column: string;
  total_records: number;
  outlier_count: number;
  outlier_percentage: number;
  q1: number;
  q3: number;
  iqr: number;
  lower_threshold: number;
  upper_threshold: number;
  method_explanation: string;
  candidates_preview: Record<string, any>[];
}

export interface GroupAnalysisRow {
  group: string;
  count: number;
  sum?: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
}

export interface GroupAnalysisResponse {
  group_by: string;
  metric_column: string;
  results: GroupAnalysisRow[];
}

export interface LinearRegressionResponse {
  x_column: string;
  y_column: string;
  slope: number;
  intercept: number;
  r_squared: number;
  p_value: number;
  formula: string;
  interpretation: string;
}

export interface AiStatusResponse {
  is_configured: boolean;
  provider: string;
  model: string;
  message: string;
  available_fallback_features: string[];
}

export interface AiChatResponse {
  answer: string;
  intent_recognized: string;
  is_ai_live: boolean;
  computed_data?: Record<string, any>;
  suggested_chart?: ChartResponse;
  suggested_followups: string[];
}

export interface ReportGenerateRequest {
  title?: string;
  include_overview?: boolean;
  include_quality?: boolean;
  include_descriptive_stats?: boolean;
  include_correlations?: boolean;
  include_transformations?: boolean;
  include_insights?: boolean;
}

export interface ReportMeta {
  id: string;
  dataset_id: string;
  title: string;
  file_format: string;
  file_size_bytes: number;
  created_at: string;
  download_url: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: {
    type: string;
    connected: boolean;
    fallback_active: boolean;
  };
  ai: {
    provider: string;
    is_configured: boolean;
    model: string;
  };
}
