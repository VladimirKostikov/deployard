{{- define "dpd.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dpd.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s" $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- define "dpd.api.fullname" -}}
{{- printf "%s-api" (include "dpd.fullname" .) }}
{{- end }}

{{- define "dpd.web.fullname" -}}
{{- printf "%s-web" (include "dpd.fullname" .) }}
{{- end }}

{{- define "dpd.labels" -}}
app.kubernetes.io/name: {{ include "dpd.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{- define "dpd.postgres.fullname" -}}
{{- printf "%s-postgres" (include "dpd.fullname" .) }}
{{- end }}

{{- define "dpd.databaseUrl" -}}
{{- if .Values.postgres.enabled -}}
{{- printf "postgresql://%s:%s@%s:5432/%s" .Values.postgres.user .Values.postgres.password (include "dpd.postgres.fullname" .) .Values.postgres.database -}}
{{- else -}}
{{- required "api.secrets.databaseUrl is required when postgres.enabled=false" .Values.api.secrets.databaseUrl -}}
{{- end -}}
{{- end }}

{{- define "dpd.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dpd.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
