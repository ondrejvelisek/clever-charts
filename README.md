# CleverCharts

Simple javascript charts suited for BI applications

## Changelog

### 1.2.3 > 1.2.4

Do not clear selection when selection is set
Deprecate histogram updateSection

### 1.2.2 > 1.2.3

Add support of updating histogram selection without refreshing
So handlers are not affected. See example of use

### 1.2.1 > 1.2.2

Fix selection changes in inverted histogram filter

### 1.2.0 > 1.2.1

Handle long labels on barchart

### 1.1.3 > 1.2.0

Break backwards compatibility of Barchart component
There was deprecated class 'Bar' and new class 'Barchart'. Now only 'Barchart' exists
It has more features (see examples/bar.html)
Consumes different format of data (see examples/data/bar/*.json)

