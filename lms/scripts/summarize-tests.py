import xml.etree.ElementTree as ET
root=ET.parse('/home/adminnazh/tjkt-lms-review-20261028/storage/logs/review-tests.xml').getroot()
for case in root.iter('testcase'):
    for failure in list(case.findall('failure'))+list(case.findall('error')):
        text=failure.text or ''
        lines=text.splitlines()
        print(case.attrib.get('classname'),case.attrib['name'])
        if 'SUBSTRING_INDEX' in text: print('SQLite compatibility: SUBSTRING_INDEX')
        else:
            for line in lines[-8:]: print(line[:300])
