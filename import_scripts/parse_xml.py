import lxml.etree as ET

def iterparse_products(xml_path):
    """Yield <product> elements one at a time from large XML file."""
    context = ET.iterparse(xml_path, events=("end",), tag="product", recover=True)
    for event, elem in context:
        yield elem
        elem.clear()
        while elem.getprevious() is not None:
            del elem.getparent()[0]
