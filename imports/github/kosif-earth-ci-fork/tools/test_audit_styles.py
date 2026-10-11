"""Source/generator regressions; browser layout remains covered separately."""
import importlib.util
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('vendor_audit', ROOT / 'tools/vendor_audit.py')
vendor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vendor)

class AuditStylesTests(unittest.TestCase):
    def test_font_import_semicolons_do_not_corrupt_following_root_rule(self):
        css = "@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');\n:root{--ink:#123}"
        scoped = vendor.scope_css(css, ':host')
        self.assertEqual(scoped.strip(), ':host{--ink:#123}')

    def test_audit_has_no_forced_tajawal_family(self):
        css = (ROOT / 'ui/audit/app.css').read_text()
        self.assertFalse(re.search(r"font-family\s*:\s*'Tajawal'[^;}]*!important", css), 'forced studio font overrides the chosen theme')

    def test_generator_preserves_readability_after_revendoring(self):
        css = vendor.readable_studio_css(".hint{font-size:9px}p{font-size:16px}")
        self.assertIn('.hint{font-size:13px}', css)
        self.assertIn('p{font-size:16px}', css)
        self.assertIn('min-block-size:44px', css)

    def test_readability_grid_does_not_override_focused_single_workspace(self):
        desktop_css = vendor.STUDIO_READABILITY.split('@media', 1)[0]
        self.assertNotRegex(desktop_css, r'\.kx-body \.workspace-grid\{[^}]*grid-template-columns')
        emitted = (ROOT / 'ui/audit/app.css').read_text()
        self.assertIn('.workspace-grid.workspace-focus-single{grid-template-columns:minmax(0,1fr)}', emitted)
        self.assertIn('.wide-left{grid-template-columns:1.55fr .85fr}', emitted)

    def test_shorthand_font_sizes_are_readable_without_losing_monospace(self):
        result = vendor.readable_studio_css('.status{font:11px/1.7 ui-monospace,monospace}.log{font:600 12px monospace}')
        self.assertIn('font:13px/1.7 ui-monospace,monospace', result)
        self.assertIn('font:600 13px monospace', result)

    def test_emitted_styles_have_no_unscoped_root_or_import_fragments(self):
        css = (ROOT / 'ui/audit/app.css').read_text()
        self.assertFalse(re.search(r':root\s*\{|display=swap', css), 'generated CSS contains an unscoped root or broken font import')

    def test_emitted_styles_include_current_readability_block(self):
        css = (ROOT / 'ui/audit/app.css').read_text()
        self.assertIn(vendor.STUDIO_READABILITY, css)

    def test_explicit_small_font_sizes_have_readability_floor(self):
        css = (ROOT / 'ui/audit/app.css').read_text()
        small = [float(n) for n in re.findall(r'font-size\s*:\s*(\d+(?:\.\d+)?)px', css) if float(n) < 13]
        self.assertEqual(small, [], 'audit functional text must not be fixed below 13px')

if __name__ == '__main__':
    unittest.main()
