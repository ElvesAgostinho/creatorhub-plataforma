-- Platform Settings Table
-- Superadmin controls for the entire platform

CREATE TABLE IF NOT EXISTS platform_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT 'true',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value) VALUES
  ('upload_video_enabled', 'true'),
  ('upload_photo_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Only admins can modify platform_settings (RLS)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform_settings"
  ON platform_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read platform_settings"
  ON platform_settings
  FOR SELECT
  USING (true);
