import unittest
from import_scripts.import_categories import extract_categories

class TestExtractCategories(unittest.TestCase):
    def test_extract_categories(self):
        # Minimal XML string for test
        xml = '''<root><product><category id="1" lang="pol">Ferramentas</category></product></root>'''
        import lxml.etree as ET
        with open("test.xml", "w") as f:
            f.write(xml)
        cats = extract_categories("test.xml")
        assert ("1", "pol") in cats
        assert cats[("1", "pol")] == "Ferramentas"

if __name__ == "__main__":
    unittest.main()
