/* Immutable reviewed source models. No runtime imports from the independent test oracle. */
export const VOLKSWAGEN_REVIEWED = {
  "core": {
    "schema_version": 1,
    "entity": "Volkswagen Group",
    "parent": "Volkswagen AG",
    "report_year": 2025,
    "basis": "IFRS Accounting Standards as adopted by EU",
    "source_pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "model_scope": "selected reported statement and note tables, not full transcription",
    "tables": {
      "income": {
        "physical_page": 4112,
        "printed_page": 461,
        "source_text_sha256": "f8068e819f6836051c80945b6bf29f37875c519439b020f04df5b608dca0a540",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "revenue": {
            "label": "Sales revenue",
            "values": [
              321913,
              324656
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost": {
            "label": "Cost of sales",
            "values": [
              -270671,
              -265184
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross": {
            "label": "Gross result",
            "values": [
              51243,
              59472
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "distribution": {
            "label": "Distribution expenses",
            "values": [
              -22804,
              -22320
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "admin": {
            "label": "Administrative expenses",
            "values": [
              -12541,
              -12754
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_income": {
            "label": "Other operating income",
            "values": [
              13615,
              14974
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_expense": {
            "label": "Other operating expenses",
            "values": [
              -20644,
              -20312
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "operating": {
            "label": "Operating result",
            "values": [
              8868,
              19060
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "equity_result": {
            "label": "Share of the result of equity-accounted investments",
            "values": [
              930,
              375
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "interest_income": {
            "label": "Interest income",
            "values": [
              1824,
              2419
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "interest_expense": {
            "label": "Interest expenses",
            "values": [
              -3245,
              -3446
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_financial": {
            "label": "Other financial result",
            "values": [
              930,
              -1602
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "financial": {
            "label": "Financial result",
            "values": [
              439,
              -2255
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "pretax": {
            "label": "Earnings before tax",
            "values": [
              9307,
              16806
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax": {
            "label": "Income tax income/expense",
            "values": [
              -2403,
              -4411
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "current_tax": {
            "label": "Current",
            "values": [
              -3837,
              -5858
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "deferred_tax": {
            "label": "Deferred",
            "values": [
              1434,
              1447
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "profit": {
            "label": "Earnings after tax",
            "values": [
              6904,
              12394
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "nci": {
            "label": "Non-controlling interests",
            "values": [
              -419,
              1043
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "hybrid": {
            "label": "Volkswagen AG hybrid capital investors",
            "values": [
              650,
              630
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "parent": {
            "label": "Volkswagen AG shareholders",
            "values": [
              6673,
              10721
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "eps": {
        "physical_page": 4160,
        "printed_page": 509,
        "source_text_sha256": "f60cbadadda12044d99434cea806d8b4d67165bf6b3968ad5a644141ced04c7b",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "mixed; counts shares, earnings EUR million, EPS EUR",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "ordinary_count": {
            "label": "Weighted-average ordinary shares",
            "values": [
              295089818,
              295089818
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "shares",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "weighted_average_count",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "preferred_count": {
            "label": "Weighted-average preferred shares",
            "values": [
              206205445,
              206205445
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "shares",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "weighted_average_count",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "ordinary_earnings": {
            "label": "Earnings attributable ordinary shares",
            "values": [
              3921,
              6304
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "preferred_earnings": {
            "label": "Earnings attributable preferred shares",
            "values": [
              2752,
              4417
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "ordinary_eps": {
            "label": "Basic/diluted ordinary EPS",
            "values": [
              13.29,
              21.36
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR per share",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "preferred_eps": {
            "label": "Basic/diluted preferred EPS",
            "values": [
              13.35,
              21.42
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR per share",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Preferred shares receive EUR0.06 more dividend; not one uniform EPS for all shares."
        ]
      },
      "assets": {
        "physical_page": 4115,
        "printed_page": 464,
        "source_text_sha256": "1a169b9adddb67326ad3b0ee0fc5283b893bd94882711217d1c38c6f9358d203",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "intangible": {
            "label": "Intangible assets",
            "values": [
              91474,
              93333
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "ppe": {
            "label": "Property plant and equipment",
            "values": [
              73076,
              71452
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "lease": {
            "label": "Lease assets",
            "values": [
              82486,
              73193
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "property": {
            "label": "Investment property",
            "values": [
              609,
              622
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "equity": {
            "label": "Equity-accounted investments",
            "values": [
              9996,
              10269
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_equity": {
            "label": "Other equity investments",
            "values": [
              7366,
              5731
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "fs_noncurrent": {
            "label": "Non-current financial services receivables",
            "values": [
              101230,
              101087
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "financial_noncurrent": {
            "label": "Non-current other financial assets",
            "values": [
              11692,
              12129
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_noncurrent": {
            "label": "Non-current other receivables",
            "values": [
              3651,
              2868
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax_noncurrent": {
            "label": "Non-current tax receivables",
            "values": [
              411,
              409
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dta": {
            "label": "Deferred tax assets",
            "values": [
              14611,
              16581
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "noncurrent": {
            "label": "Total non-current assets",
            "values": [
              396602,
              387674
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "inventory": {
            "label": "Inventories",
            "values": [
              56042,
              56720
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "trade": {
            "label": "Trade receivables",
            "values": [
              20760,
              21130
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "fs_current": {
            "label": "Current financial services receivables",
            "values": [
              70026,
              68855
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "financial_current": {
            "label": "Current other financial assets",
            "values": [
              20158,
              18649
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_current": {
            "label": "Current other receivables",
            "values": [
              9881,
              10217
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax_current": {
            "label": "Current tax receivables",
            "values": [
              2674,
              2038
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "securities": {
            "label": "Marketable securities and time deposits",
            "values": [
              29522,
              27326
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cash": {
            "label": "Cash and cash equivalents",
            "values": [
              38801,
              40296
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "current": {
            "label": "Total current assets",
            "values": [
              247865,
              245231
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Total assets",
            "values": [
              644467,
              632905
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "liabilities": {
        "physical_page": 4116,
        "printed_page": 465,
        "source_text_sha256": "c6c53849ae7c86dcc7f7ce93b7ebb606609673ecdb4112a3bf6c715fc68f8145",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "subscribed": {
            "label": "Subscribed capital",
            "values": [
              1283,
              1283
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "capital": {
            "label": "Capital reserve",
            "values": [
              14551,
              14551
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "retained": {
            "label": "Retained earnings",
            "values": [
              161357,
              155130
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "reserves": {
            "label": "Other reserves",
            "values": [
              -3190,
              -2560
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "hybrid": {
            "label": "Hybrid capital investors",
            "values": [
              14275,
              13890
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "parent_equity": {
            "label": "Shareholder and hybrid equity",
            "values": [
              188277,
              182294
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "nci": {
            "label": "Non-controlling interests",
            "values": [
              14777,
              14437
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "equity": {
            "label": "Total equity",
            "values": [
              203054,
              196731
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "financial_nc": {
            "label": "Non-current financial liabilities",
            "values": [
              137214,
              137061
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_financial_nc": {
            "label": "Non-current other financial liabilities",
            "values": [
              6422,
              6548
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_nc": {
            "label": "Non-current other liabilities",
            "values": [
              11420,
              10584
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dtl": {
            "label": "Deferred tax liabilities",
            "values": [
              9963,
              10900
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "pension": {
            "label": "Pension provisions",
            "values": [
              22826,
              27602
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax_provision_nc": {
            "label": "Non-current provisions for taxes",
            "values": [
              3367,
              4084
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "provision_nc": {
            "label": "Non-current other provisions",
            "values": [
              23676,
              22355
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "noncurrent": {
            "label": "Total non-current liabilities",
            "values": [
              214887,
              219134
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "financial_c": {
            "label": "Current financial liabilities",
            "values": [
              127489,
              117020
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "trade": {
            "label": "Trade payables",
            "values": [
              30490,
              29772
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax": {
            "label": "Tax payables",
            "values": [
              497,
              724
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_financial_c": {
            "label": "Current other financial liabilities",
            "values": [
              13643,
              14364
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_c": {
            "label": "Current other liabilities",
            "values": [
              24427,
              24752
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax_provision_c": {
            "label": "Current provisions for taxes",
            "values": [
              1986,
              1698
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "provision_c": {
            "label": "Current other provisions",
            "values": [
              27993,
              28709
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "current": {
            "label": "Total current liabilities",
            "values": [
              226525,
              217039
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Total equity and liabilities",
            "values": [
              644467,
              632905
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "cashflow": {
        "physical_page": 4118,
        "printed_page": 467,
        "source_text_sha256": "b0b650697ceb2ca2c803bf7d0760159045de93a45476e763ffdcf1cf2a61bec8",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "opening": {
            "label": "Cash beginning",
            "values": [
              40296,
              43522
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "pretax": {
            "label": "Earnings before tax",
            "values": [
              9307,
              16806
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax": {
            "label": "Income taxes paid",
            "values": [
              -5152,
              -6187
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "depreciation": {
            "label": "Depreciation impairment PPE intangibles investment property",
            "values": [
              16866,
              12858
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "development": {
            "label": "Amortization impairment development costs",
            "values": [
              8365,
              7209
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "equity_impair": {
            "label": "Impairment equity investments",
            "values": [
              38,
              710
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "lease_depreciation": {
            "label": "Lease depreciation impairment",
            "values": [
              12203,
              11279
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "disposal_gain": {
            "label": "Disposal result",
            "values": [
              -95,
              110
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "equity_adjustment": {
            "label": "Equity-accounted result adjustment",
            "values": [
              968,
              2362
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_noncash": {
            "label": "Other noncash",
            "values": [
              -946,
              903
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "inventory": {
            "label": "Change inventories",
            "values": [
              -896,
              -2695
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "receivables": {
            "label": "Change receivables excluding FS",
            "values": [
              -211,
              -2083
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "liabilities": {
            "label": "Change liabilities excluding financial",
            "values": [
              3165,
              52
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "provisions": {
            "label": "Change provisions",
            "values": [
              1760,
              4247
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "lease_change": {
            "label": "Change lease assets",
            "values": [
              -24166,
              -19358
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "fs_change": {
            "label": "Change FS receivables",
            "values": [
              -6196,
              -9061
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cfo": {
            "label": "Operating cash flow",
            "values": [
              15009,
              17151
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "capex": {
            "label": "Intangibles PPE property investment",
            "values": [
              -15299,
              -17202
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "capitalized_dev": {
            "label": "Capitalized development",
            "values": [
              -9047,
              -10244
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "acquire_subs": {
            "label": "Acquire subsidiaries",
            "values": [
              -359,
              -284
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "acquire_other": {
            "label": "Acquire other equity",
            "values": [
              -2106,
              -2152
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dispose_subs": {
            "label": "Dispose subsidiaries",
            "values": [
              67,
              -148
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dispose_other": {
            "label": "Dispose other equity",
            "values": [
              951,
              231
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dispose_assets": {
            "label": "Dispose assets",
            "values": [
              733,
              947
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "securities": {
            "label": "Change securities and deposits",
            "values": [
              -1485,
              -203
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "loans": {
            "label": "Change loans",
            "values": [
              -938,
              -2517
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cfi": {
            "label": "Investing cash flow",
            "values": [
              -27484,
              -31573
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "capital": {
            "label": "Capital contributions redemptions",
            "values": [
              420,
              -1144
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dividends": {
            "label": "Dividends paid",
            "values": [
              -4460,
              -5779
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "nci_transactions": {
            "label": "NCI capital transactions",
            "values": [
              352,
              null
            ],
            "status": [
              "reported_number",
              "reported_dash"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "bond_issue": {
            "label": "Bond proceeds",
            "values": [
              35993,
              38420
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "bond_repay": {
            "label": "Bond repayments",
            "values": [
              -32669,
              -32617
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "paper_issue": {
            "label": "Paper and notes proceeds",
            "values": [
              27549,
              13828
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "paper_repay": {
            "label": "Paper and notes repayments",
            "values": [
              -30417,
              -12414
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_debt": {
            "label": "Other financial liabilities change",
            "values": [
              16624,
              12179
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "lease_repay": {
            "label": "Lease repayments",
            "values": [
              -1476,
              -1334
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cff": {
            "label": "Financing cash flow",
            "values": [
              11918,
              11140
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "fx": {
            "label": "Cash FX",
            "values": [
              -938,
              55
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "loss_allowance": {
            "label": "Cash allowance",
            "values": [
              0,
              1
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "change": {
            "label": "Net change cash",
            "values": [
              -1495,
              -3226
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "closing": {
            "label": "Cash ending",
            "values": [
              38801,
              40296
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "securities_loans": {
            "label": "Securities deposits loans",
            "values": [
              47395,
              44662
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross_liquidity": {
            "label": "Gross liquidity",
            "values": [
              86197,
              84959
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "borrowings": {
            "label": "Third party borrowings",
            "values": [
              -264703,
              -254081
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "net_liquidity": {
            "label": "Net liquidity",
            "values": [
              -178506,
              -169122
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "2024 commercial paper reclassified to same2025 basis. Dash is preserved, only explicitly tagged equation context interprets it as additive no movement."
        ]
      },
      "oci": {
        "physical_page": 4113,
        "printed_page": 462,
        "source_text_sha256": "6be03f8e19f3d5cd1df19cff0a0f2313770c979d5d2967c6b4eeb6d823f2498b",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "profit": {
            "label": "Earnings after tax",
            "values": [
              6904,
              12394
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "nonreclass": {
            "label": "Non-reclassifiable items",
            "values": [
              4550,
              1592
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "reclass": {
            "label": "Reclassifiable items",
            "values": [
              -1650,
              379
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "oci": {
            "label": "Other comprehensive income",
            "values": [
              2900,
              1971
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Total comprehensive income",
            "values": [
              9804,
              14365
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "2024 data from physical4114; total columns only."
        ],
        "additional_sources": [
          {
            "physical_page": 4114,
            "source_text_sha256": "2ff118fc3436812dcb797b5b717ab95ccb1cb8db4b7d45777eca8747060bfc97"
          }
        ]
      },
      "equity_rollforward": {
        "physical_page": 4117,
        "printed_page": 466,
        "source_text_sha256": "7b934e982b0c034dcd38bf10163baa1790d65705134af36c5dfba4b073e380fd",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "unadjusted_opening": {
            "label": "Opening before IAS8",
            "values": [
              196731,
              189912
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "correction": {
            "label": "IAS8 prior-year correction",
            "values": [
              null,
              -726
            ],
            "status": [
              "reported_dash",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance_adjustment",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "opening": {
            "label": "Adjusted opening",
            "values": [
              196731,
              189186
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "profit": {
            "label": "Earnings after tax",
            "values": [
              6904,
              12394
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "oci": {
            "label": "OCI",
            "values": [
              2900,
              1971
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "capital": {
            "label": "Capital changes",
            "values": [
              428,
              -1138
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "dividends": {
            "label": "Dividends",
            "values": [
              -4460,
              -5779
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "ownership": {
            "label": "Ownership capital transactions",
            "values": [
              352,
              null
            ],
            "status": [
              "reported_number",
              "reported_dash"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other changes",
            "values": [
              199,
              97
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "closing": {
            "label": "Closing equity",
            "values": [
              203054,
              196731
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Total equity column only, not a transcription of every equity component."
        ]
      },
      "pension": {
        "physical_page": 4179,
        "printed_page": 528,
        "source_text_sha256": "92d9f36bd984977a8f35530e6a9273224dbf2659e5f2b6343dd1a42638bdf037",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "funded": {
            "label": "Funded DBO",
            "values": [
              24050,
              24803
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "assets": {
            "label": "Plan assets",
            "values": [
              20060,
              18108
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "unfunded": {
            "label": "Unfunded DBO",
            "values": [
              18571,
              20670
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "ceiling": {
            "label": "IAS19 ceiling",
            "values": [
              50,
              39
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "net": {
            "label": "Net liability",
            "values": [
              22611,
              27404
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "provision": {
            "label": "Pension provisions",
            "values": [
              22826,
              27602
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other_assets": {
            "label": "Pension assets",
            "values": [
              215,
              198
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "fair_value_other_equity": {
        "physical_page": 4195,
        "printed_page": 544,
        "source_text_sha256": "87fe939e1f89362e6e27cb38e84f61b4177cf6c71c96292d98945596dc0bef73",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "total": {
            "label": "Other equity investments measured FV",
            "values": [
              4328,
              2460
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "level1": {
            "label": "Level1",
            "values": [
              86,
              42
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "level2": {
            "label": "Level2",
            "values": [
              3534,
              1753
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "level3": {
            "label": "Level3",
            "values": [
              708,
              665
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "2024 Level1 visual42 with superscript1; extracted421 is not the number. Level2 visually1753 with footnote1, extracted17531."
        ],
        "visual_corrections": [
          {
            "year": 2024,
            "row": "level1",
            "raw_token": "421",
            "correct_value": 42,
            "footnote": "1",
            "visual": "visuals/physical-4195.png"
          },
          {
            "year": 2024,
            "row": "level2",
            "raw_token": "1,7531",
            "correct_value": 1753,
            "footnote": "1",
            "visual": "visuals/physical-4195.png"
          }
        ],
        "comparative_basis": {
          "2024": "adjusted",
          "source_footnote": "Certain equity investments reclassified from Level1 to Level2 because they do not have unhindered market access. Prior-year figures adjusted.",
          "physical_page": 4195
        }
      },
      "lease_liability": {
        "physical_page": 4189,
        "printed_page": 538,
        "source_text_sha256": "39d62a5f41c3a351eb97ff784bfa5c01883a497d0dc91cbea12b237760cdb4c6",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance_and_future_contractual_maturities",
        "measurement": "reported",
        "rows": {
          "noncurrent": {
            "label": "Noncurrent lease liability",
            "values": [
              6337,
              5924
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "current": {
            "label": "Current lease liability",
            "values": [
              1320,
              1252
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "carrying": {
            "label": "Lease liability carrying",
            "values": [
              7657,
              7176
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "under1": {
            "label": "Undiscounted maturity under1year",
            "values": [
              1588,
              1507
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "future_undiscounted_contractual_cashflow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported",
            "maturity_bucket": "under_one_year"
          },
          "one5": {
            "label": "Undiscounted maturity1–5years",
            "values": [
              4759,
              4296
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "future_undiscounted_contractual_cashflow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported",
            "maturity_bucket": "one_to_five_years"
          },
          "over5": {
            "label": "Undiscounted maturity over5years",
            "values": [
              2964,
              2958
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "future_undiscounted_contractual_cashflow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported",
            "maturity_bucket": "over_five_years"
          },
          "undiscounted": {
            "label": "Total undiscounted payments",
            "values": [
              9311,
              8760
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "future_undiscounted_contractual_cashflow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported",
            "maturity_bucket": "all_remaining_terms"
          }
        },
        "notes": [
          "Carrying liability excludes future interest; future undiscounted cash amounts cannot replace carrying."
        ]
      },
      "finance_lease_investment": {
        "physical_page": 4191,
        "printed_page": 540,
        "source_text_sha256": "6d9533fc2088feb2289fc92f1f6b890017f4cfc15fd108decd3a40d76c036d5b",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "undiscounted": {
            "label": "Non-discounted lease payments",
            "values": [
              75626,
              73142
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "residual": {
            "label": "Non-guaranteed residual value",
            "values": [
              4092,
              3783
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "interest": {
            "label": "Unearned interest income",
            "values": [
              -7999,
              -8033
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allowance": {
            "label": "Loss allowance",
            "values": [
              -1598,
              -1414
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "net": {
            "label": "Net investment",
            "values": [
              70122,
              67478
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Not identical to note16 finance lease receivables70169/67575; preserve difference pending explicit scope bridge."
        ]
      },
      "associate_revenue": {
        "physical_page": 4131,
        "printed_page": 480,
        "source_text_sha256": "d6e18b8f1b108ce80121d5ddbde20998509c9496db27679e14c8265f3218897f",
        "periods": [
          "label2025:QuantumScape/Gotion2024-10-01/2025-09-30;Sinotruk2024-07-01/2025-06-30",
          "label2024:QuantumScape/Gotion2023-10-01/2024-09-30;Sinotruk2023-07-01/2024-06-30"
        ],
        "unit": "EUR million",
        "scope": "100% material associate financial information, not Group consolidated",
        "temporal_type": "mixed_associate_annual_periods",
        "measurement": "reported",
        "rows": {
          "quantumscape": {
            "label": "QuantumScape revenue",
            "values": [
              null,
              null
            ],
            "status": [
              "reported_dash",
              "reported_dash"
            ],
            "unit": "EUR million",
            "periods": [
              "2024-10-01/2025-09-30",
              "2023-10-01/2024-09-30"
            ],
            "temporal_type": "annual_flow",
            "scope": "quantumscape standalone100percent associate",
            "measurement": "reported"
          },
          "gotion": {
            "label": "Gotion revenue",
            "values": [
              4797,
              4347
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2024-10-01/2025-09-30",
              "2023-10-01/2024-09-30"
            ],
            "temporal_type": "annual_flow",
            "scope": "gotion standalone100percent associate",
            "measurement": "reported"
          },
          "sinotruk": {
            "label": "Sinotruk revenue",
            "values": [
              12371,
              11893
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2024-07-01/2025-06-30",
              "2023-07-01/2024-06-30"
            ],
            "temporal_type": "annual_flow",
            "scope": "sinotruk standalone100percent associate",
            "measurement": "reported"
          }
        },
        "notes": [
          "Do not re-date to Group calendar year or aggregate as Group revenue."
        ]
      },
      "segment_revenue": {
        "physical_page": 4149,
        "printed_page": 498,
        "source_text_sha256": "3774e04ef9b691f5bc95c2c825a4be19f61b3360004be1e07abefcfd72a95052",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "reporting-segment revenues including intersegment, eliminated to Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "passenger": {
            "label": "Passenger Cars and Light Commercial Vehicles total revenue",
            "values": [
              244484,
              241526
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          },
          "commercial": {
            "label": "Commercial Vehicles total revenue",
            "values": [
              42540,
              46183
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          },
          "financial": {
            "label": "Financial Services total revenue",
            "values": [
              62136,
              58769
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          },
          "segments": {
            "label": "Total reporting segments",
            "values": [
              349160,
              346478
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other operating companies",
            "values": [
              6487,
              5906
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          },
          "reconciliation": {
            "label": "Reconciliation",
            "values": [
              -33733,
              -27728
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          },
          "group": {
            "label": "Volkswagen Group revenue",
            "values": [
              321913,
              324656
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment revenues including intersegment, eliminated to Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Three reportable segments;2024 recast. Not brand-group or Automotive Division classification."
        ]
      },
      "segment_operating": {
        "physical_page": 4149,
        "printed_page": 498,
        "source_text_sha256": "3774e04ef9b691f5bc95c2c825a4be19f61b3360004be1e07abefcfd72a95052",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "reporting-segment operating result reconciled to Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "passenger": {
            "label": "Passenger operating result",
            "values": [
              4966,
              13656
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          },
          "commercial": {
            "label": "Commercial operating result",
            "values": [
              2417,
              4218
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          },
          "financial": {
            "label": "Financial Services operating result",
            "values": [
              3708,
              3119
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          },
          "segments": {
            "label": "Total reporting segments operating result",
            "values": [
              11090,
              20993
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other operating companies operating result",
            "values": [
              198,
              359
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          },
          "reconciliation": {
            "label": "Reconciliation operating result",
            "values": [
              -2420,
              -2291
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          },
          "group": {
            "label": "Group operating result",
            "values": [
              8868,
              19060
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "reporting-segment operating result reconciled to Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Profit shares from JVs are financial result, not operating result."
        ]
      },
      "revenue_products": {
        "physical_page": 4151,
        "printed_page": 500,
        "source_text_sha256": "0514ca1b26904900589176fdb41907d46f8665b51fb75e96bab95362e427b3c0",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "vehicles": {
            "label": "Vehicles",
            "values": [
              190554,
              195673
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "parts": {
            "label": "Genuine parts",
            "values": [
              22931,
              23467
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "used": {
            "label": "Used vehicles and third-party products",
            "values": [
              35796,
              35161
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "engines": {
            "label": "Engines powertrains parts",
            "values": [
              14350,
              14995
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "power": {
            "label": "Power Engineering",
            "values": [
              4854,
              4332
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "motorcycles": {
            "label": "Motorcycles",
            "values": [
              746,
              831
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "leasing": {
            "label": "Leasing business",
            "values": [
              23088,
              21011
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "interest": {
            "label": "Interest and similar income",
            "values": [
              13861,
              14184
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "hedges": {
            "label": "Hedges sales revenue",
            "values": [
              238,
              -219
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other revenue",
            "values": [
              15495,
              15220
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Group sales",
            "values": [
              321913,
              324656
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "chinese_jv_revenue": {
        "physical_page": 4134,
        "printed_page": 483,
        "source_text_sha256": "0fb9761c290e027fcaccd69c2f9a75477d32fac4f3a4a42bb4de6c88e5e8c7e1",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "100% Chinese joint ventures, unconsolidated",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "faw": {
            "label": "FAW-Volkswagen Automotive Company",
            "values": [
              33588,
              39166
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "100% Chinese joint ventures, unconsolidated",
            "measurement": "reported"
          },
          "saic_auto": {
            "label": "SAIC-Volkswagen Automotive Company",
            "values": [
              14208,
              17293
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "100% Chinese joint ventures, unconsolidated",
            "measurement": "reported"
          },
          "saic_sales": {
            "label": "SAIC-Volkswagen Sales Company",
            "values": [
              15184,
              19012
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "100% Chinese joint ventures, unconsolidated",
            "measurement": "reported"
          }
        },
        "notes": [
          "SAIC Auto revenue mostly sales to SAIC Sales; no sum as incremental Group revenue. Equity interest FAW40%,SAICAuto50%,SAICSales48%2025/30%2024."
        ],
        "aggregation_policy": "not_additive_to_Group_or_across_SAIC_auto_and_sales"
      },
      "equity_carrying": {
        "physical_page": 4168,
        "printed_page": 517,
        "source_text_sha256": "b3afa14ee3aa3448833ecdc4960eae1aa1dddd9fd4a3ea33ad440b2f993db594",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "jv": {
            "label": "Joint ventures",
            "values": [
              4983,
              5698
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "associates": {
            "label": "Associates",
            "values": [
              5013,
              4571
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Equity accounted investments",
            "values": [
              9996,
              10269
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "tax_reconciliation": {
        "physical_page": 4159,
        "printed_page": 508,
        "source_text_sha256": "973edf20da526e8f63cf241e4b52a8334ebf986cada2c5a3a82e2ded3647bcda",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "expected": {
            "label": "Expected tax at30percent",
            "values": [
              2792,
              5042
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "foreign": {
            "label": "Different foreign rates",
            "values": [
              -497,
              -528
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "exempt": {
            "label": "Tax exempt income",
            "values": [
              -813,
              -625
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "nondeductible": {
            "label": "Nondeductible expense",
            "values": [
              1588,
              773
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "losses": {
            "label": "Loss carryforwards",
            "values": [
              1061,
              66
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "permanent": {
            "label": "Permanent differences",
            "values": [
              -321,
              -103
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "credits": {
            "label": "Tax credits",
            "values": [
              -108,
              -142
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "prior": {
            "label": "Prior-period",
            "values": [
              -709,
              -477
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "rate_change": {
            "label": "Rate changes",
            "values": [
              -877,
              119
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "withholding": {
            "label": "Withholding",
            "values": [
              354,
              374
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other",
            "values": [
              -67,
              -88
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "effective": {
            "label": "Effective tax expense",
            "values": [
              2403,
              4411
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "intangible_rollforward": {
        "physical_page": 4161,
        "printed_page": 510,
        "source_text_sha256": "bb0deae6bd92013c679c97c5f352767a1a12f079c1ca16512af6a1091937acdd",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_rollforward_and_closing_balance",
        "measurement": "reported",
        "rows": {
          "cost_open": {
            "label": "Opening cost",
            "values": [
              143714,
              133053
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost_fx": {
            "label": "Cost FX",
            "values": [
              -829,
              157
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost_group": {
            "label": "Cost consolidation",
            "values": [
              298,
              11
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost_add": {
            "label": "Cost additions",
            "values": [
              11716,
              12741
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost_transfers": {
            "label": "Cost transfers",
            "values": [
              376,
              281
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost_disposals": {
            "label": "Cost disposals",
            "values": [
              8642,
              2530
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cost_close": {
            "label": "Closing cost",
            "values": [
              146633,
              143714
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "accum_open": {
            "label": "Opening accumulated depreciation impairment",
            "values": [
              50381,
              43944
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "accum_fx": {
            "label": "Accumulated FX",
            "values": [
              -236,
              -32
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "accum_group": {
            "label": "Accumulated consolidation",
            "values": [
              32,
              -8
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "amortization": {
            "label": "Amortization",
            "values": [
              8994,
              8263
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "impairment": {
            "label": "Impairment additions",
            "values": [
              4288,
              489
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "accum_transfer": {
            "label": "Accumulated transfers",
            "values": [
              22,
              18
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "accum_disposal": {
            "label": "Accumulated disposals",
            "values": [
              8322,
              2292
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "reversal": {
            "label": "Impairment reversal",
            "values": [
              0,
              1
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "accum_close": {
            "label": "Closing accumulated",
            "values": [
              55159,
              50381
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "net": {
            "label": "Intangible NBV",
            "values": [
              91474,
              93333
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Prior-year totals from physical4162; class reallocation109 between development-underway and other intangibles at2025 opening, total unchanged."
        ],
        "additional_sources": [
          {
            "physical_page": 4162,
            "source_text_sha256": "6c1b6278f52b4ab53081f7272cfa6823cf9fef0d6c41c41b9d85937992585063"
          }
        ]
      },
      "provision_rollforward": {
        "physical_page": 4185,
        "printed_page": 534,
        "source_text_sha256": "fce80ea50ed03eaa3ca04583a9886c11015a8a2bfb3deaf4cfe4b51a22e83617",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_rollforward_and_closing_balance",
        "measurement": "reported",
        "rows": {
          "opening": {
            "label": "Opening other provisions",
            "values": [
              51064,
              46554
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "fx": {
            "label": "FX",
            "values": [
              -1041,
              221
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "group": {
            "label": "Consolidation",
            "values": [
              37,
              14
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "utilization": {
            "label": "Utilization",
            "values": [
              21353,
              18774
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "additions": {
            "label": "Additions",
            "values": [
              27656,
              27641
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "discount": {
            "label": "Unwinding and discount change",
            "values": [
              305,
              503
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "reversals": {
            "label": "Reversals",
            "values": [
              5000,
              5096
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "closing": {
            "label": "Closing other provisions",
            "values": [
              51669,
              51064
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "current": {
            "label": "Current provisions",
            "values": [
              27993,
              28709
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "noncurrent": {
            "label": "Non-current provisions",
            "values": [
              23676,
              22355
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "debt_components": {
        "physical_page": 4175,
        "printed_page": 524,
        "source_text_sha256": "0cf8f1c8f3cf6038673cfecc563b97944a412b16dcc21edaa2942c441895d90d",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "bonds": {
            "label": "Bonds",
            "values": [
              108385,
              106958
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "paper": {
            "label": "Commercial paper and notes",
            "values": [
              40856,
              47521
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "banks": {
            "label": "Banks",
            "values": [
              37016,
              32280
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "deposits": {
            "label": "Deposits business",
            "values": [
              68347,
              57559
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "loans": {
            "label": "Loans and miscellaneous",
            "values": [
              2443,
              2587
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "leases": {
            "label": "Lease liabilities",
            "values": [
              7657,
              7176
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Financial liabilities",
            "values": [
              264703,
              254081
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": []
      },
      "debt_rollforward": {
        "physical_page": 4207,
        "printed_page": 556,
        "source_text_sha256": "1cfe05d3fcb4aa7f7a3648f73f711f8894417cc7c098ebbf0f2505c6e043142d",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_rollforward_and_closing_balance",
        "measurement": "reported",
        "rows": {
          "opening": {
            "label": "Opening third-party borrowings",
            "values": [
              254081,
              232813
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "cash": {
            "label": "Cash-effective changes",
            "values": [
              15233,
              18490
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "fx": {
            "label": "FX",
            "values": [
              -6251,
              -279
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "group": {
            "label": "Changes group",
            "values": [
              43,
              211
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "held_for_sale": {
            "label": "Held for sale",
            "values": [
              null,
              0
            ],
            "status": [
              "reported_dash",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other noncash",
            "values": [
              1598,
              2846
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "closing": {
            "label": "Closing third-party borrowings",
            "values": [
              264703,
              254081
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "2024 commercial paper recast, repayment sign included."
        ]
      },
      "ecl_amortized": {
        "physical_page": 4210,
        "printed_page": 559,
        "source_text_sha256": "cc7fb8394852d2e8af624b713a5439a4de2a64fa2d8d6dd520efb47af21d04fc",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "closing_balance",
        "measurement": "reported",
        "rows": {
          "gross_stage1": {
            "label": "Gross stage1",
            "values": [
              143260,
              146080
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross_stage2": {
            "label": "Gross stage2",
            "values": [
              18137,
              17540
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross_stage3": {
            "label": "Gross stage3",
            "values": [
              3096,
              2962
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross_simplified": {
            "label": "Gross simplified",
            "values": [
              22750,
              22502
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross_stage4": {
            "label": "Gross acquired-credit-impaired",
            "values": [
              511,
              387
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "gross_total": {
            "label": "Gross total",
            "values": [
              187754,
              189472
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allow_stage1": {
            "label": "Allowance stage1",
            "values": [
              1144,
              1320
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allow_stage2": {
            "label": "Allowance stage2",
            "values": [
              581,
              637
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allow_stage3": {
            "label": "Allowance stage3",
            "values": [
              1255,
              1473
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allow_simplified": {
            "label": "Allowance simplified",
            "values": [
              1175,
              762
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allow_stage4": {
            "label": "Allowance acquired-credit-impaired",
            "values": [
              159,
              46
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "allow_total": {
            "label": "Allowance total",
            "values": [
              4314,
              4238
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "net": {
            "label": "Amortized financial asset carrying",
            "values": [
              183441,
              185234
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "2024 data physical4211; net carrying physical4192. Excludes separate lease/contract gross table; gross not net."
        ],
        "additional_sources": [
          {
            "physical_page": 4211,
            "source_text_sha256": "4f8746d857c586bba12d77817d8af8ca0dac3ab7b275e06676667f90b052b7b6"
          },
          {
            "physical_page": 4192,
            "source_text_sha256": "a9f73b53e56585c2795513b56f7b11f308ce101d5636671f2df9f8a8459e32e6"
          }
        ]
      },
      "mobility_var": {
        "physical_page": 4231,
        "printed_page": 580,
        "source_text_sha256": "e26ee8b45a18a841864be0947708f3cc120b3ec9b2e5d0f03b4a79d0d7eb54e2",
        "periods": [
          "2025-12-31:model99.9percent365days",
          "2024-12-31:model99percent60days"
        ],
        "unit": "EUR million",
        "scope": "Volkswagen Group Mobility only",
        "temporal_type": "risk_measurement",
        "measurement": "reported",
        "rows": {
          "interest": {
            "label": "Interest VaR",
            "values": [
              2697,
              958
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31:model99.9percent365days",
              "2024-12-31:model99percent60days"
            ],
            "temporal_type": "risk_measurement",
            "scope": "Volkswagen Group Mobility only",
            "measurement": "reported"
          },
          "currency": {
            "label": "Currency VaR",
            "values": [
              2502,
              191
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31:model99.9percent365days",
              "2024-12-31:model99percent60days"
            ],
            "temporal_type": "risk_measurement",
            "scope": "Volkswagen Group Mobility only",
            "measurement": "reported"
          },
          "combined": {
            "label": "Combined VaR",
            "values": [
              3987,
              981
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-12-31:model99.9percent365days",
              "2024-12-31:model99percent60days"
            ],
            "temporal_type": "risk_measurement",
            "scope": "Volkswagen Group Mobility only",
            "measurement": "reported"
          }
        },
        "notes": [
          "Method change at physical4222; raw year-on-year growth is not like-for-like. Combined VaR includes diversification, not sum."
        ],
        "additional_sources": [
          {
            "physical_page": 4222,
            "source_text_sha256": "e2beea96e7c80388aac3e431af582b8ca1dce8388b2f728ac6b0536a04941822"
          }
        ],
        "comparability": {
          "year_on_year_like_for_like": false,
          "reason": "Confidence and horizon changed;2025 99.9%365days;2024 99%60days."
        }
      },
      "automotive_roi": {
        "physical_page": 4235,
        "printed_page": 584,
        "source_text_sha256": "9c438afadf29e0fe948fb5d0c96483111e46fc47367ba09384aafefe681e7504",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million except ROI percent",
        "scope": "Automotive Division including proportional Chinese JVs excluding PPA",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "profit": {
            "label": "Operating result after tax",
            "values": [
              6548,
              12842
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "Automotive Division including proportional Chinese JVs excluding PPA",
            "measurement": "reported"
          },
          "capital": {
            "label": "Average invested capital",
            "values": [
              135159,
              129229
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "average_balance",
            "scope": "Automotive Division including proportional Chinese JVs excluding PPA",
            "measurement": "reported"
          },
          "roi": {
            "label": "ROI percent",
            "values": [
              4.8,
              9.9
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "percent",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "Automotive Division including proportional Chinese JVs excluding PPA",
            "measurement": "reported"
          }
        },
        "notes": [
          "2024 reporting recast; not consolidated Group ratio."
        ]
      },
      "auditor_fees": {
        "physical_page": 4249,
        "printed_page": 598,
        "source_text_sha256": "d41f6e1844e137aa27ecbf9c486013354d6971c0e78fc65984e51a9793dc79d6",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "unit": "EUR million",
        "scope": "consolidated Volkswagen Group",
        "temporal_type": "annual_flow",
        "measurement": "reported",
        "rows": {
          "audit": {
            "label": "Financial statement audit",
            "values": [
              26,
              30
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "assurance": {
            "label": "Other assurance",
            "values": [
              6,
              5
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "tax": {
            "label": "Tax advisory",
            "values": [
              null,
              null
            ],
            "status": [
              "reported_dash",
              "reported_dash"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "other": {
            "label": "Other services",
            "values": [
              0,
              1
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          },
          "total": {
            "label": "Total EY fees",
            "values": [
              32,
              36
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "scope": "consolidated Volkswagen Group",
            "measurement": "reported"
          }
        },
        "notes": [
          "Visual confirms prior assurance5+footnote1 and total36+footnote1, not51/361."
        ],
        "visual_corrections": [
          {
            "year": 2024,
            "row": "assurance",
            "raw_token": "51",
            "correct_value": 5,
            "footnote": "1",
            "visual": "visuals/physical-4249.png"
          },
          {
            "year": 2024,
            "row": "total",
            "raw_token": "361",
            "correct_value": 36,
            "footnote": "1",
            "visual": "visuals/physical-4249.png"
          }
        ],
        "comparative_basis": {
          "2024": "adjusted",
          "physical_page": 4249
        }
      }
    },
    "equations": [
      {
        "id": "income_gross",
        "table": "income",
        "target": "gross",
        "terms": {
          "revenue": 1,
          "cost": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "income_operating",
        "table": "income",
        "target": "operating",
        "terms": {
          "gross": 1,
          "distribution": 1,
          "admin": 1,
          "other_income": 1,
          "other_expense": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "income_financial",
        "table": "income",
        "target": "financial",
        "terms": {
          "equity_result": 1,
          "interest_income": 1,
          "interest_expense": 1,
          "other_financial": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "income_pretax",
        "table": "income",
        "target": "pretax",
        "terms": {
          "operating": 1,
          "financial": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "income_tax",
        "table": "income",
        "target": "tax",
        "terms": {
          "current_tax": 1,
          "deferred_tax": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "income_profit",
        "table": "income",
        "target": "profit",
        "terms": {
          "pretax": 1,
          "tax": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "income_allocation",
        "table": "income",
        "target": "profit",
        "terms": {
          "parent": 1,
          "hybrid": 1,
          "nci": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "assets_noncurrent",
        "table": "assets",
        "target": "noncurrent",
        "terms": {
          "intangible": 1,
          "ppe": 1,
          "lease": 1,
          "property": 1,
          "equity": 1,
          "other_equity": 1,
          "fs_noncurrent": 1,
          "financial_noncurrent": 1,
          "other_noncurrent": 1,
          "tax_noncurrent": 1,
          "dta": 1
        },
        "columns": null,
        "absolute_tolerance": 6,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "assets_current",
        "table": "assets",
        "target": "current",
        "terms": {
          "inventory": 1,
          "trade": 1,
          "fs_current": 1,
          "financial_current": 1,
          "other_current": 1,
          "tax_current": 1,
          "securities": 1,
          "cash": 1
        },
        "columns": null,
        "absolute_tolerance": 5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "assets_total",
        "table": "assets",
        "target": "total",
        "terms": {
          "current": 1,
          "noncurrent": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "liability_parent",
        "table": "liabilities",
        "target": "parent_equity",
        "terms": {
          "subscribed": 1,
          "capital": 1,
          "retained": 1,
          "reserves": 1,
          "hybrid": 1
        },
        "columns": null,
        "absolute_tolerance": 3.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "liability_equity",
        "table": "liabilities",
        "target": "equity",
        "terms": {
          "parent_equity": 1,
          "nci": 1
        },
        "columns": null,
        "absolute_tolerance": 1.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "liability_noncurrent",
        "table": "liabilities",
        "target": "noncurrent",
        "terms": {
          "financial_nc": 1,
          "other_financial_nc": 1,
          "other_nc": 1,
          "dtl": 1,
          "pension": 1,
          "tax_provision_nc": 1,
          "provision_nc": 1
        },
        "columns": null,
        "absolute_tolerance": 4.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "liability_current",
        "table": "liabilities",
        "target": "current",
        "terms": {
          "financial_c": 1,
          "trade": 1,
          "tax": 1,
          "other_financial_c": 1,
          "other_c": 1,
          "tax_provision_c": 1,
          "provision_c": 1
        },
        "columns": null,
        "absolute_tolerance": 4.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "liability_total",
        "table": "liabilities",
        "target": "total",
        "terms": {
          "equity": 1,
          "noncurrent": 1,
          "current": 1
        },
        "columns": null,
        "absolute_tolerance": 2.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "cfo",
        "table": "cashflow",
        "target": "cfo",
        "terms": {
          "pretax": 1,
          "tax": 1,
          "depreciation": 1,
          "development": 1,
          "equity_impair": 1,
          "lease_depreciation": 1,
          "disposal_gain": 1,
          "equity_adjustment": 1,
          "other_noncash": 1,
          "inventory": 1,
          "receivables": 1,
          "liabilities": 1,
          "provisions": 1,
          "lease_change": 1,
          "fs_change": 1
        },
        "columns": null,
        "absolute_tolerance": 8.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "cfi",
        "table": "cashflow",
        "target": "cfi",
        "terms": {
          "capex": 1,
          "capitalized_dev": 1,
          "acquire_subs": 1,
          "acquire_other": 1,
          "dispose_subs": 1,
          "dispose_other": 1,
          "dispose_assets": 1,
          "securities": 1,
          "loans": 1
        },
        "columns": null,
        "absolute_tolerance": 5.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "cff",
        "table": "cashflow",
        "target": "cff",
        "terms": {
          "capital": 1,
          "dividends": 1,
          "nci_transactions": 1,
          "bond_issue": 1,
          "bond_repay": 1,
          "paper_issue": 1,
          "paper_repay": 1,
          "other_debt": 1,
          "lease_repay": 1
        },
        "columns": null,
        "absolute_tolerance": 5.0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "cash_change",
        "table": "cashflow",
        "target": "change",
        "terms": {
          "cfo": 1,
          "cfi": 1,
          "cff": 1,
          "fx": 1,
          "loss_allowance": 1
        },
        "columns": null,
        "absolute_tolerance": 3,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "cash_closing",
        "table": "cashflow",
        "target": "closing",
        "terms": {
          "opening": 1,
          "change": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "gross_liquidity",
        "table": "cashflow",
        "target": "gross_liquidity",
        "terms": {
          "closing": 1,
          "securities_loans": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "net_liquidity",
        "table": "cashflow",
        "target": "net_liquidity",
        "terms": {
          "gross_liquidity": 1,
          "borrowings": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "oci_components",
        "table": "oci",
        "target": "oci",
        "terms": {
          "nonreclass": 1,
          "reclass": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "oci_total",
        "table": "oci",
        "target": "total",
        "terms": {
          "profit": 1,
          "oci": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "equity_opening",
        "table": "equity_rollforward",
        "target": "opening",
        "terms": {
          "unadjusted_opening": 1,
          "correction": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "equity_close",
        "table": "equity_rollforward",
        "target": "closing",
        "terms": {
          "opening": 1,
          "profit": 1,
          "oci": 1,
          "capital": 1,
          "dividends": 1,
          "ownership": 1,
          "other": 1
        },
        "columns": null,
        "absolute_tolerance": 4,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "pension_net",
        "table": "pension",
        "target": "net",
        "terms": {
          "funded": 1,
          "assets": -1,
          "unfunded": 1,
          "ceiling": 1
        },
        "columns": null,
        "absolute_tolerance": 2.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "pension_presentation",
        "table": "pension",
        "target": "net",
        "terms": {
          "provision": 1,
          "other_assets": -1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "fair_value_levels",
        "table": "fair_value_other_equity",
        "target": "total",
        "terms": {
          "level1": 1,
          "level2": 1,
          "level3": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "lease_carrying",
        "table": "lease_liability",
        "target": "carrying",
        "terms": {
          "noncurrent": 1,
          "current": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "lease_undiscounted",
        "table": "lease_liability",
        "target": "undiscounted",
        "terms": {
          "under1": 1,
          "one5": 1,
          "over5": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "finance_lease_net",
        "table": "finance_lease_investment",
        "target": "net",
        "terms": {
          "undiscounted": 1,
          "residual": 1,
          "interest": 1,
          "allowance": 1
        },
        "columns": null,
        "absolute_tolerance": 2.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "segment_revenue_total",
        "table": "segment_revenue",
        "target": "segments",
        "terms": {
          "passenger": 1,
          "commercial": 1,
          "financial": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "segment_revenue_group",
        "table": "segment_revenue",
        "target": "group",
        "terms": {
          "segments": 1,
          "other": 1,
          "reconciliation": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "segment_operating_total",
        "table": "segment_operating",
        "target": "segments",
        "terms": {
          "passenger": 1,
          "commercial": 1,
          "financial": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "segment_operating_group",
        "table": "segment_operating",
        "target": "group",
        "terms": {
          "segments": 1,
          "other": 1,
          "reconciliation": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "revenue_products",
        "table": "revenue_products",
        "target": "total",
        "terms": {
          "vehicles": 1,
          "parts": 1,
          "used": 1,
          "engines": 1,
          "power": 1,
          "motorcycles": 1,
          "leasing": 1,
          "interest": 1,
          "hedges": 1,
          "other": 1
        },
        "columns": null,
        "absolute_tolerance": 5.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "equity_carrying",
        "table": "equity_carrying",
        "target": "total",
        "terms": {
          "jv": 1,
          "associates": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "effective_tax",
        "table": "tax_reconciliation",
        "target": "effective",
        "terms": {
          "expected": 1,
          "foreign": 1,
          "exempt": 1,
          "nondeductible": 1,
          "losses": 1,
          "permanent": 1,
          "credits": 1,
          "prior": 1,
          "rate_change": 1,
          "withholding": 1,
          "other": 1
        },
        "columns": null,
        "absolute_tolerance": 6,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "intangible_cost",
        "table": "intangible_rollforward",
        "target": "cost_close",
        "terms": {
          "cost_open": 1,
          "cost_fx": 1,
          "cost_group": 1,
          "cost_add": 1,
          "cost_transfers": 1,
          "cost_disposals": -1
        },
        "columns": null,
        "absolute_tolerance": 3.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "intangible_accum",
        "table": "intangible_rollforward",
        "target": "accum_close",
        "terms": {
          "accum_open": 1,
          "accum_fx": 1,
          "accum_group": 1,
          "amortization": 1,
          "impairment": 1,
          "accum_transfer": 1,
          "accum_disposal": -1,
          "reversal": -1
        },
        "columns": null,
        "absolute_tolerance": 4.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "intangible_net",
        "table": "intangible_rollforward",
        "target": "net",
        "terms": {
          "cost_close": 1,
          "accum_close": -1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "provision_rollforward",
        "table": "provision_rollforward",
        "target": "closing",
        "terms": {
          "opening": 1,
          "fx": 1,
          "group": 1,
          "utilization": -1,
          "additions": 1,
          "discount": 1,
          "reversals": -1
        },
        "columns": null,
        "absolute_tolerance": 4,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "provision_maturities",
        "table": "provision_rollforward",
        "target": "closing",
        "terms": {
          "current": 1,
          "noncurrent": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "debt_components",
        "table": "debt_components",
        "target": "total",
        "terms": {
          "bonds": 1,
          "paper": 1,
          "banks": 1,
          "deposits": 1,
          "loans": 1,
          "leases": 1
        },
        "columns": null,
        "absolute_tolerance": 3.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "debt_rollforward",
        "table": "debt_rollforward",
        "target": "closing",
        "terms": {
          "opening": 1,
          "cash": 1,
          "fx": 1,
          "group": 1,
          "held_for_sale": 1,
          "other": 1
        },
        "columns": null,
        "absolute_tolerance": 3.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "ecl_gross",
        "table": "ecl_amortized",
        "target": "gross_total",
        "terms": {
          "gross_stage1": 1,
          "gross_stage2": 1,
          "gross_stage3": 1,
          "gross_simplified": 1,
          "gross_stage4": 1
        },
        "columns": null,
        "absolute_tolerance": 3,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "ecl_allowance",
        "table": "ecl_amortized",
        "target": "allow_total",
        "terms": {
          "allow_stage1": 1,
          "allow_stage2": 1,
          "allow_stage3": 1,
          "allow_simplified": 1,
          "allow_stage4": 1
        },
        "columns": null,
        "absolute_tolerance": 3,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "ecl_net",
        "table": "ecl_amortized",
        "target": "net",
        "terms": {
          "gross_total": 1,
          "allow_total": -1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "auditor_fees",
        "table": "auditor_fees",
        "target": "total",
        "terms": {
          "audit": 1,
          "assurance": 1,
          "tax": 1,
          "other": 1
        },
        "columns": null,
        "absolute_tolerance": 2.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      }
    ],
    "source_exceptions": [
      {
        "id": "EX001",
        "kind": "resolved_extraction",
        "physical_page": 4195,
        "detail": "2024 Level1 is42 plus footnote1, not421. Render verifies42+1753+665=2460."
      },
      {
        "id": "EX002",
        "kind": "unresolved_scope",
        "pages": [
          4169,
          4191
        ],
        "detail": "Finance lease receivables70169/67575 differ net investment70122/67478. No fabricated reconciling value."
      },
      {
        "id": "EX003",
        "kind": "unresolved_scope",
        "pages": [
          4155,
          4189
        ],
        "detail": "Lease interest280/266 in financial result versus289/275 lease disclosure; retain exact source values."
      },
      {
        "id": "EX004",
        "kind": "rounding",
        "detail": "Ordinary independently rounded sums can differ; equality to reported source remains exact regardless arithmetic tolerance."
      },
      {
        "id": "EX005",
        "kind": "unresolved_scope",
        "pages": [
          4212,
          4213,
          4215
        ],
        "detail": "Maximum credit risk2024 guarantees/commitments14834=gross14994-allowance160.2025 presented13244 equals gross, while allowance170 exists. Preserve comparison asymmetry, do not rewrite."
      },
      {
        "id": "EX006",
        "kind": "unresolved_scope",
        "pages": [
          4155,
          4184
        ],
        "detail": "2024 pension net interest971 in interest note versus967 pension note;2025 both936. Preserve."
      }
    ],
    "assurance": {
      "financial": {
        "level": "reasonable",
        "opinion": "unqualified",
        "auditor": "EY GmbH & Co. KG",
        "date": "2026-03-06",
        "scope": "2025 consolidated financial statements and specified management report",
        "pages": [
          4294,
          4307
        ]
      },
      "sustainability": {
        "overall_level": "limited",
        "reasonable_only": [
          "EU Taxonomy disclosures",
          "DCI2024 and2025 named tables",
          "DCI base-year recalculation2020–2024"
        ],
        "pages": [
          4308,
          4313
        ],
        "carbon_certificates": "existence considered; effectiveness not considered"
      },
      "remuneration": {
        "level": "reasonable",
        "scope": "Sec162 AktG content, excluding extra-statutory appropriateness and market-alignment disclosures",
        "pages": [
          4314,
          4315
        ]
      },
      "icfr_effectiveness_opinion": false,
      "kam_separate_opinions": false,
      "esef_pdf_covered": false
    },
    "model_revision": 2
  },
  "management": {
    "schema_version": 1,
    "entity": "Volkswagen Group and explicitly separate Volkswagen AG parent",
    "report_year": 2025,
    "source_pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "model_scope": "selected management disclosure comparison models",
    "tables": {
      "division_revenue": {
        "physical_page": 3766,
        "printed_page": 115,
        "source_text_sha256": "a68d22549feb33c21e304c4601cc520b5992afd9e8fbb1e389b4c3668b9e9c99",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              290390,
              290646
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              62136,
              58769
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              -30612,
              -24759
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              321913,
              324656
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "division_operating": {
        "physical_page": 3766,
        "printed_page": 115,
        "source_text_sha256": "a68d22549feb33c21e304c4601cc520b5992afd9e8fbb1e389b4c3668b9e9c99",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              5279,
              16300
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              3708,
              3119
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              -119,
              -358
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              8868,
              19060
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "division_cfo": {
        "physical_page": 3770,
        "printed_page": 119,
        "source_text_sha256": "c279c5fcf826da56664f03f70487cf0361e8579c49cdc05fef0eac3abedd76d2",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              31406,
              34263
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              -14836,
              -15832
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              -1560,
              -1280
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              15009,
              17151
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "division_operating_investing": {
        "physical_page": 3770,
        "printed_page": 119,
        "source_text_sha256": "c279c5fcf826da56664f03f70487cf0361e8579c49cdc05fef0eac3abedd76d2",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              -24961,
              -29077
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              -513,
              -883
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              414,
              1107
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              -25060,
              -28853
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "division_net_cashflow": {
        "physical_page": 3770,
        "printed_page": 119,
        "source_text_sha256": "c279c5fcf826da56664f03f70487cf0361e8579c49cdc05fef0eac3abedd76d2",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              6445,
              5186
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              -15350,
              -16715
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              -1146,
              -173
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              -10051,
              -11702
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "division_net_liquidity": {
        "physical_page": 3770,
        "printed_page": 119,
        "source_text_sha256": "c279c5fcf826da56664f03f70487cf0361e8579c49cdc05fef0eac3abedd76d2",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              34497,
              34414
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              -214566,
              -205188
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              1563,
              1652
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              -178506,
              -169122
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "division_assets": {
        "physical_page": 3774,
        "printed_page": 123,
        "source_text_sha256": "d088f7deccb0009b413917f58c337437183ede8d6c7be92abbd348fec990053d",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "rows": {
          "auto": {
            "label": "Automotive Division",
            "values": [
              419684,
              419772
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division before interdivision eliminations",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fs": {
            "label": "Financial Services Division",
            "values": [
              321408,
              312224
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Financial Services Division before interdivision eliminations",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "elimination": {
            "label": "Interdivision eliminations",
            "values": [
              -96625,
              -99091
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "interdivision consolidation adjustments",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "group": {
            "label": "Consolidated Volkswagen Group",
            "values": [
              644467,
              632905
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "explicit division columns reconciled to Group",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2024 automotive reporting structure recast to2025; eliminations separate."
        ]
      },
      "hgb_income": {
        "physical_page": 3777,
        "printed_page": 126,
        "source_text_sha256": "7375747cd722fc08e814255c55cdae038ced52ab32286cf6e648503e8a1f3f63",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "revenue": {
            "label": "Sales",
            "values": [
              97968,
              94078
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "cost": {
            "label": "Cost of sales",
            "values": [
              -88204,
              -85924
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "gross": {
            "label": "Gross profit",
            "values": [
              9764,
              8154
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "dga": {
            "label": "Distribution general administrative",
            "values": [
              -7898,
              -8023
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "other": {
            "label": "Net other operating result",
            "values": [
              882,
              415
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "financial": {
            "label": "Financial result",
            "values": [
              4865,
              4809
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "tax": {
            "label": "Tax",
            "values": [
              -112,
              -221
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "profit": {
            "label": "Net income",
            "values": [
              7500,
              5133
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "brought_forward": {
            "label": "Retained profits brought forward",
            "values": [
              4,
              1
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01",
              "2024-01-01"
            ],
            "temporal_type": "opening_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "reserve": {
            "label": "Appropriation to reserves",
            "values": [
              -3750,
              -1960
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "retained": {
            "label": "Net retained profits",
            "values": [
              3755,
              3175
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          }
        },
        "scope": "Volkswagen AG parent only",
        "unit": "EUR million",
        "basis": "German HGB parent condensed",
        "notes": []
      },
      "hgb_balance": {
        "physical_page": 3778,
        "printed_page": 127,
        "source_text_sha256": "1e00e977103827ebe3e6e7b55149f11d3a67cf2436bd1b2fc7cb4b582bd97ff8",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "rows": {
          "fixed": {
            "label": "Fixed assets",
            "values": [
              167754,
              165130
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "inventories": {
            "label": "Inventories",
            "values": [
              6505,
              6842
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "receivables": {
            "label": "Receivables including prepaid",
            "values": [
              31644,
              30776
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "cash": {
            "label": "Cash-in-hand and bank balances",
            "values": [
              9112,
              7326
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "assets": {
            "label": "Total assets",
            "values": [
              215015,
              210073
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "equity": {
            "label": "Equity",
            "values": [
              47133,
              42803
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "special": {
            "label": "Special tax allowable reserves",
            "values": [
              17,
              17
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "long": {
            "label": "Long-term debt",
            "values": [
              23470,
              29169
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "medium": {
            "label": "Medium-term debt",
            "values": [
              75005,
              60580
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "short": {
            "label": "Short-term debt",
            "values": [
              69390,
              77504
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          },
          "financing": {
            "label": "Total financing",
            "values": [
              215015,
              210073
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Volkswagen AG parent only",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_balance",
            "measurement": "reported",
            "basis": "German HGB parent condensed"
          }
        },
        "scope": "Volkswagen AG parent only",
        "unit": "EUR million",
        "basis": "German HGB parent condensed",
        "notes": []
      },
      "automotive_rd": {
        "physical_page": 3768,
        "printed_page": 117,
        "source_text_sha256": "47b420de617fae93623117196c6135e8c441b5898162c90c04ba7b926fa73597",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "total": {
            "label": "Total R&D costs",
            "values": [
              19412,
              21030
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "capitalized": {
            "label": "Capitalized development costs",
            "values": [
              9343,
              10244
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "amortization": {
            "label": "Amortization of capitalized costs",
            "values": [
              8365,
              7209
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "pnl": {
            "label": "R&D recognized in P&L",
            "values": [
              18434,
              17995
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR million",
            "scope": "Automotive Division",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Automotive Division",
        "unit": "EUR million",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Prior2024 adjusted; cashflow capitalized development9047 differs additions9343. Group P&L R&D18396 differs Automotive18434."
        ]
      },
      "deliveries": {
        "physical_page": 3746,
        "printed_page": 95,
        "source_text_sha256": "abc92d54c01f6cedc2c4545b1530a1867d0d5f49d036ed20779d36510eba6a9a",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "passenger": {
            "label": "Passenger and light commercial",
            "values": [
              8678334,
              8692465
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group including equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "commercial": {
            "label": "Commercial vehicles",
            "values": [
              305566,
              334216
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group including equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "total": {
            "label": "Total deliveries",
            "values": [
              8983900,
              9026681
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group including equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "bev": {
            "label": "BEV deliveries including heavy commercial",
            "values": [
              983120,
              744571
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group including equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Volkswagen Group including equity-accounted Chinese JVs",
        "unit": "vehicles",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Prior figures updated for subsequent statistical trends; deliveries to end customer, not vehicle sales."
        ]
      },
      "sales_production": {
        "physical_page": 3753,
        "printed_page": 102,
        "source_text_sha256": "64ffb9e1593784483c7d97e7743abc3558c93579b9fb45cc7a3bdf57597bd5a8",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "sales_incl": {
            "label": "Vehicle sales including China JVs",
            "values": [
              9022111,
              9036653
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group including equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "sales_excl": {
            "label": "Vehicle sales excluding China JVs",
            "values": [
              6433789,
              6294998
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group excluding equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "production_excl": {
            "label": "Production excluding China JVs",
            "values": [
              6249942,
              6213442
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "vehicles",
            "scope": "Volkswagen Group excluding equity-accounted Chinese JVs",
            "periods": [
              "2025-01-01/2025-12-31",
              "2024-01-01/2024-12-31"
            ],
            "temporal_type": "annual_flow",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Volkswagen Group boundary specified by row",
        "unit": "vehicles",
        "basis": "EU-adopted IFRS management presentation",
        "notes": []
      },
      "workforce": {
        "physical_page": 3800,
        "printed_page": 149,
        "source_text_sha256": "7a1fd738809ca82eed2808197e54d09d88a268c0a17a5d6738e2a1fece29da0f",
        "periods": [
          "2025-12-31",
          "2024-12-31"
        ],
        "rows": {
          "incl": {
            "label": "Year-end total including China JVs",
            "values": [
              662942,
              679472
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "people",
            "scope": "Group including China JVs",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_headcount",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "excl": {
            "label": "Year-end total excluding China JVs",
            "values": [
              602659,
              614082
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "people",
            "scope": "Group excluding China JVs",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_headcount",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "germany": {
            "label": "Year-end Germany",
            "values": [
              284032,
              293338
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "people",
            "scope": "Germany Group workforce",
            "periods": [
              "2025-12-31",
              "2024-12-31"
            ],
            "temporal_type": "closing_headcount",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Volkswagen Group headcount by boundary",
        "unit": "people",
        "basis": "EU-adopted IFRS management presentation",
        "notes": []
      },
      "dividend_payout": {
        "physical_page": 3757,
        "printed_page": 106,
        "source_text_sha256": "86ee9a5314c1b99cf0103096453f72336c945e67566c7d341a606338008098f0",
        "periods": [
          "2025-01-01/2025-12-31",
          "2024-01-01/2024-12-31"
        ],
        "rows": {
          "ordinary": {
            "label": "Dividend per ordinary share",
            "values": [
              5.2,
              6.3
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR per share",
            "scope": "Volkswagen AG shareholder dividend based Group attributable profit",
            "periods": [
              "2025 underlying year; proposed for2026 payment",
              "2024 underlying year; paid2025"
            ],
            "temporal_type": "dividend_proposal_vs_prior_paid",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "preferred": {
            "label": "Dividend per preferred share",
            "values": [
              5.26,
              6.36
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR per share",
            "scope": "Volkswagen AG shareholder dividend based Group attributable profit",
            "periods": [
              "2025 underlying year; proposed for2026 payment",
              "2024 underlying year; paid2025"
            ],
            "temporal_type": "dividend_proposal_vs_prior_paid",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "reported_payout": {
            "label": "Unadjusted payout ratio",
            "values": [
              39.2,
              29.6
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG shareholder dividend based Group attributable profit",
            "periods": [
              "2025 underlying year; proposed for2026 payment",
              "2024 underlying year; paid2025"
            ],
            "temporal_type": "dividend_proposal_vs_prior_paid",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Volkswagen AG shareholder dividend based Group attributable profit",
        "unit": "mixed; per-row units required",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "2025 proposed dividend;2024 underlying-year dividend paid2025.2025 adjusted ratio30% excludes Porsche goodwill in assessment base."
        ]
      },
      "forecast2026": {
        "physical_page": 3813,
        "printed_page": 162,
        "source_text_sha256": "16029b610a7338a83cd944f13189b16b55ae776add2c2f824c97040482362e0b",
        "periods": [
          "2026 lower bound",
          "2026 upper bound"
        ],
        "rows": {
          "revenue_growth": {
            "label": "Group revenue growth forecast",
            "values": [
              0,
              3
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "percent",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2026 lower bound",
              "2026 upper bound"
            ],
            "temporal_type": "forecast_interval",
            "measurement": "forecast",
            "basis": "EU-adopted IFRS management presentation"
          },
          "ros": {
            "label": "Group ROS forecast",
            "values": [
              4,
              5.5
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "percent",
            "scope": "consolidated Volkswagen Group",
            "periods": [
              "2026 lower bound",
              "2026 upper bound"
            ],
            "temporal_type": "forecast_interval",
            "measurement": "forecast",
            "basis": "EU-adopted IFRS management presentation"
          },
          "investment": {
            "label": "Automotive investment ratio forecast",
            "values": [
              11,
              12
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Automotive Division",
            "periods": [
              "2026 lower bound",
              "2026 upper bound"
            ],
            "temporal_type": "forecast_interval",
            "measurement": "forecast",
            "basis": "EU-adopted IFRS management presentation"
          },
          "ncf": {
            "label": "Automotive net cash flow forecast",
            "values": [
              3,
              6
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR billion",
            "scope": "Automotive Division",
            "periods": [
              "2026 lower bound",
              "2026 upper bound"
            ],
            "temporal_type": "forecast_interval",
            "measurement": "forecast",
            "basis": "EU-adopted IFRS management presentation"
          },
          "liquidity": {
            "label": "Automotive net liquidity forecast",
            "values": [
              32,
              34
            ],
            "status": [
              "reported_number",
              "reported_number"
            ],
            "unit": "EUR billion",
            "scope": "Automotive Division",
            "periods": [
              "2026 lower bound",
              "2026 upper bound"
            ],
            "temporal_type": "forecast_interval",
            "measurement": "forecast",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "scope stated by individual row",
        "unit": "mixed; per-row units required",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Issued Feb24 2026; assumes prevailing tariff situation persists. Not actual2026."
        ]
      },
      "shareholder_percentages": {
        "physical_page": 3758,
        "printed_page": 107,
        "source_text_sha256": "3588c196007935daaf69338a67dc189173582f310670cd839760d20bc1a086e8",
        "periods": [
          "2025-12-31"
        ],
        "rows": {
          "porsche_capital": {
            "label": "Porsche SE capital share",
            "values": [
              31.9
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG",
            "periods": [
              "2025-12-31"
            ],
            "temporal_type": "closing_ownership",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation",
            "denominator": "subscribed capital ordinary plus preferred"
          },
          "porsche_vote": {
            "label": "Porsche SE voting rights",
            "values": [
              53.3
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG",
            "periods": [
              "2025-12-31"
            ],
            "temporal_type": "closing_ownership",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation",
            "denominator": "ordinary voting shares only"
          },
          "state_capital": {
            "label": "Lower Saxony capital share",
            "values": [
              11.8
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG",
            "periods": [
              "2025-12-31"
            ],
            "temporal_type": "closing_ownership",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation",
            "denominator": "subscribed capital ordinary plus preferred"
          },
          "state_vote": {
            "label": "Lower Saxony voting rights",
            "values": [
              20.0
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG",
            "periods": [
              "2025-12-31"
            ],
            "temporal_type": "closing_ownership",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation",
            "denominator": "ordinary voting shares only"
          },
          "qatar_capital": {
            "label": "Qatar capital share",
            "values": [
              10.4
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG",
            "periods": [
              "2025-12-31"
            ],
            "temporal_type": "closing_ownership",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation",
            "denominator": "subscribed capital ordinary plus preferred"
          },
          "qatar_vote": {
            "label": "Qatar voting rights",
            "values": [
              17.0
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG",
            "periods": [
              "2025-12-31"
            ],
            "temporal_type": "closing_ownership",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation",
            "denominator": "ordinary voting shares only"
          }
        },
        "scope": "Volkswagen AG",
        "unit": "percent",
        "basis": "EU-adopted IFRS management presentation",
        "notes": []
      },
      "lti_policy": {
        "physical_page": 3694,
        "printed_page": 43,
        "source_text_sha256": "76bb87655b229efed2d749c1f4fad2ab77cf5389f7f674e939656577a560bd15",
        "periods": [
          "2025 policy"
        ],
        "rows": {
          "chair_target": {
            "label": "Chair target remuneration",
            "values": [
              5900000
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "2025 remuneration system at100percent scope of activity",
            "periods": [
              "2025 policy"
            ],
            "temporal_type": "policy_parameter",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "member_target": {
            "label": "Member target remuneration",
            "values": [
              2500000
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "2025 remuneration system at100percent scope of activity",
            "periods": [
              "2025 policy"
            ],
            "temporal_type": "policy_parameter",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "cap_percent": {
            "label": "Stated maximum percent",
            "values": [
              250
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "2025 remuneration system at100percent scope of activity",
            "periods": [
              "2025 policy"
            ],
            "temporal_type": "policy_parameter",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "chair_cap": {
            "label": "Stated chair maximum amount",
            "values": [
              11800000
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "2025 remuneration system at100percent scope of activity",
            "periods": [
              "2025 policy"
            ],
            "temporal_type": "policy_parameter",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "member_cap": {
            "label": "Stated member maximum amount",
            "values": [
              5000000
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "2025 remuneration system at100percent scope of activity",
            "periods": [
              "2025 policy"
            ],
            "temporal_type": "policy_parameter",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "2025 remuneration system at100percent scope of activity",
        "unit": "EUR",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Open source-consistency question: stated amounts equal200%, while stated percentage is250%; later text distinguishes older paid200% plans/current250% plans. Overall remuneration caps and grant/payment timing also differ. No source correction assumed."
        ]
      },
      "antlitz_remuneration": {
        "physical_page": 3698,
        "printed_page": 47,
        "source_text_sha256": "f1bbcc1521a515e79ab593cf522752e14ee5524f182f81f169cdbe216afba8f7",
        "periods": [
          "2025 remuneration report convention"
        ],
        "rows": {
          "base": {
            "label": "Base salary",
            "values": [
              1500000
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fringe": {
            "label": "Fringe benefits",
            "values": [
              187061
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "bonus": {
            "label": "Annual bonus",
            "values": [
              1716000
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "lti": {
            "label": "LTI paid for2021–24",
            "values": [
              1672278.19
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "waiver": {
            "label": "Amount deducted under waiver",
            "values": [
              -537710.6
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "total": {
            "label": "Reported granted and owed total",
            "values": [
              5075339.19
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "pension": {
            "label": "IAS19 service expense",
            "values": [
              607886
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "including_pension": {
            "label": "Reported total including pension",
            "values": [
              5683225.19
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
            "periods": [
              "2025 remuneration report convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Arno Antlitz remuneration under Sec162 reporting convention",
        "unit": "EUR",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Reported total equals positive components without displayed waiver; preserve unresolved gross/net/timing presentation. Annual2025 bonus paid2026 is counted as granted2025."
        ]
      },
      "kilian_former_remuneration": {
        "physical_page": 3714,
        "printed_page": 63,
        "source_text_sha256": "7738faf7195822048ab4fb9f69a2c0c6ce1878c6683f97848c0316694fe8ca0a",
        "periods": [
          "2025-07-05/2025-12-31 remuneration convention"
        ],
        "rows": {
          "base": {
            "label": "Base salary",
            "values": [
              739726.03
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Gunnar Kilian former-member portion only",
            "periods": [
              "2025-07-05/2025-12-31 remuneration convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "fringe": {
            "label": "Fringe benefits",
            "values": [
              90066
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Gunnar Kilian former-member portion only",
            "periods": [
              "2025-07-05/2025-12-31 remuneration convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "bonus": {
            "label": "Annual bonus",
            "values": [
              846246.58
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Gunnar Kilian former-member portion only",
            "periods": [
              "2025-07-05/2025-12-31 remuneration convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "lti": {
            "label": "LTI",
            "values": [
              66261.7
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Gunnar Kilian former-member portion only",
            "periods": [
              "2025-07-05/2025-12-31 remuneration convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "waiver": {
            "label": "Waiver",
            "values": [
              -181745.77
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Gunnar Kilian former-member portion only",
            "periods": [
              "2025-07-05/2025-12-31 remuneration convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          },
          "total": {
            "label": "Reported total",
            "values": [
              1560554.53
            ],
            "status": [
              "reported_number"
            ],
            "unit": "EUR",
            "scope": "Gunnar Kilian former-member portion only",
            "periods": [
              "2025-07-05/2025-12-31 remuneration convention"
            ],
            "temporal_type": "remuneration_disclosure",
            "measurement": "reported",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Gunnar Kilian former-member portion only",
        "unit": "EUR",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Unlike active-member tables, this total includes displayed waiver deduction. Sum differs byEUR0.01 rounding."
        ]
      },
      "share_returns": {
        "physical_page": 3756,
        "printed_page": 105,
        "source_text_sha256": "33ddc2fae51df4e046427a0dc34071b9e7f6d47473129afe236a9a389cd94a40",
        "periods": [
          "2025"
        ],
        "rows": {
          "ordinary_price": {
            "label": "Ordinary price return",
            "values": [
              14.1
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG ordinary shares",
            "periods": [
              "2025"
            ],
            "temporal_type": "annual_return",
            "measurement": "price_return_ex_dividend",
            "basis": "EU-adopted IFRS management presentation"
          },
          "preferred_price": {
            "label": "Preferred price return",
            "values": [
              16.3
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG preferred shares",
            "periods": [
              "2025"
            ],
            "temporal_type": "annual_return",
            "measurement": "price_return_ex_dividend",
            "basis": "EU-adopted IFRS management presentation"
          },
          "dax": {
            "label": "DAX total return performance index",
            "values": [
              23.0
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "DAX performance index",
            "periods": [
              "2025"
            ],
            "temporal_type": "annual_return",
            "measurement": "total_return_dividend_reinvested",
            "basis": "EU-adopted IFRS management presentation"
          },
          "sector": {
            "label": "Sector price return",
            "values": [
              -4.3
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "EURO STOXX Automobiles and Parts price index",
            "periods": [
              "2025"
            ],
            "temporal_type": "annual_return",
            "measurement": "price_return_ex_dividend",
            "basis": "EU-adopted IFRS management presentation"
          },
          "ordinary_total": {
            "label": "Ordinary total return with dividends",
            "values": [
              21.2
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG ordinary shares",
            "periods": [
              "2025"
            ],
            "temporal_type": "annual_return",
            "measurement": "total_return_dividend_reinvested",
            "basis": "EU-adopted IFRS management presentation"
          },
          "preferred_total": {
            "label": "Preferred total return with dividends",
            "values": [
              23.9
            ],
            "status": [
              "reported_number"
            ],
            "unit": "percent",
            "scope": "Volkswagen AG preferred shares",
            "periods": [
              "2025"
            ],
            "temporal_type": "annual_return",
            "measurement": "total_return_dividend_reinvested",
            "basis": "EU-adopted IFRS management presentation"
          }
        },
        "scope": "Volkswagen listed shares and distinct market indices",
        "unit": "percent",
        "basis": "EU-adopted IFRS management presentation",
        "notes": [
          "Narrative says both outperformedDAX; figures distinguish price and total return and do not support ordinary share outperformance on either basis. Preserve wording/figures as source-consistency issue, no external assertion."
        ]
      }
    },
    "equations": [
      {
        "id": "division_revenue_bridge",
        "table": "division_revenue",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "division_operating_bridge",
        "table": "division_operating",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "division_cfo_bridge",
        "table": "division_cfo",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "division_operating_investing_bridge",
        "table": "division_operating_investing",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "division_net_cashflow_bridge",
        "table": "division_net_cashflow",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "division_net_liquidity_bridge",
        "table": "division_net_liquidity",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "division_assets_bridge",
        "table": "division_assets",
        "target": "group",
        "terms": {
          "auto": 1,
          "fs": 1,
          "elimination": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "hgb_gross",
        "table": "hgb_income",
        "target": "gross",
        "terms": {
          "revenue": 1,
          "cost": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "hgb_profit",
        "table": "hgb_income",
        "target": "profit",
        "terms": {
          "gross": 1,
          "dga": 1,
          "other": 1,
          "financial": 1,
          "tax": 1
        },
        "columns": null,
        "absolute_tolerance": 3,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "hgb_retained",
        "table": "hgb_income",
        "target": "retained",
        "terms": {
          "profit": 1,
          "brought_forward": 1,
          "reserve": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "hgb_assets",
        "table": "hgb_balance",
        "target": "assets",
        "terms": {
          "fixed": 1,
          "inventories": 1,
          "receivables": 1,
          "cash": 1
        },
        "columns": null,
        "absolute_tolerance": 2.5,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "hgb_financing",
        "table": "hgb_balance",
        "target": "financing",
        "terms": {
          "equity": 1,
          "special": 1,
          "long": 1,
          "medium": 1,
          "short": 1
        },
        "columns": null,
        "absolute_tolerance": 3,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "rd_pnl",
        "table": "automotive_rd",
        "target": "pnl",
        "terms": {
          "total": 1,
          "capitalized": -1,
          "amortization": 1
        },
        "columns": null,
        "absolute_tolerance": 2,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "delivery_total",
        "table": "deliveries",
        "target": "total",
        "terms": {
          "passenger": 1,
          "commercial": 1
        },
        "columns": null,
        "absolute_tolerance": 0,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "antlitz_pension",
        "table": "antlitz_remuneration",
        "target": "including_pension",
        "terms": {
          "total": 1,
          "pension": 1
        },
        "columns": null,
        "absolute_tolerance": 0.02,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      },
      {
        "id": "kilian_post_total",
        "table": "kilian_former_remuneration",
        "target": "total",
        "terms": {
          "base": 1,
          "fringe": 1,
          "bonus": 1,
          "lti": 1,
          "waiver": 1
        },
        "columns": null,
        "absolute_tolerance": 0.035,
        "dash_policy": "reported_dash_as_no_additive_movement_only"
      }
    ],
    "source_consistency_questions": [
      {
        "id": "LTI_CAP",
        "pages": [
          3694,
          3705,
          3709
        ],
        "classification": "unresolved policy vintage and cap presentation",
        "do_not_repair": true
      },
      {
        "id": "WAIVER_TOTAL",
        "pages": [
          3696,
          3698,
          3714
        ],
        "classification": "unresolved gross earned/paid and waiver reporting convention",
        "do_not_repair": true
      },
      {
        "id": "SHARE_BENCHMARK",
        "pages": [
          3755,
          3756
        ],
        "classification": "narrative claim versus numeric return basis",
        "do_not_repair": true
      }
    ],
    "risk_score_definition": {
      "page": 3816,
      "formula": "Prob * (Mat + (Rep + Req) / 2)",
      "criteria_range": [
        0,
        10
      ],
      "perspective": "net after mitigation",
      "opportunities_in_RMS": false,
      "no_material_MA_score_means_no_risk": false,
      "management_effectiveness_statement_is_independent_assurance": false,
      "high_likelihood_boundary": {
        "text": "greater than50percent",
        "chart": "at least50percent"
      },
      "note": "Boundary wording retained; do not silently harmonize."
    },
    "cross_core_links": [
      {
        "table": "division_revenue",
        "row": "group",
        "core_table": "income",
        "core_row": "revenue"
      },
      {
        "table": "division_operating",
        "row": "group",
        "core_table": "income",
        "core_row": "operating"
      },
      {
        "table": "division_cfo",
        "row": "group",
        "core_table": "cashflow",
        "core_row": "cfo"
      },
      {
        "table": "division_net_liquidity",
        "row": "group",
        "core_table": "cashflow",
        "core_row": "net_liquidity"
      },
      {
        "table": "division_assets",
        "row": "group",
        "core_table": "assets",
        "core_row": "total"
      }
    ],
    "revision": 2
  },
  "annex": {
    "schema_version": 1,
    "source_pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "covered_physical_range": [
      4094,
      4103
    ],
    "selected_site_range": [
      17,
      68
    ],
    "scope": "Selected site metadata and protected-area counts, with selected complete protected-name cells; not a transcription of every ENCORE list",
    "sites": {
      "17": {
        "source_site_number": 17,
        "physical_page": 4094,
        "printed_page": 443,
        "source_text_sha256": "6662b7fa79d7db8515e111ff306ff3c5be150417b6065a719e6472383f18001c",
        "site_name_as_reported": "Škoda Mladá Boleslav plant",
        "country_as_reported": "Czech Republic",
        "group_as_reported": "Core brand group",
        "category": "Production",
        "protected_area_count": 5,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles; Energy generation from fossil fuels",
        "protected_area_names_selected_full_cell_as_reported": [
          "Radouč",
          "Chlum u Nepřevázky",
          "Radouč",
          "Vrch Baba u Kosmonos",
          "Bezděčn"
        ]
      },
      "18": {
        "source_site_number": 18,
        "physical_page": 4094,
        "printed_page": 443,
        "source_text_sha256": "6662b7fa79d7db8515e111ff306ff3c5be150417b6065a719e6472383f18001c",
        "site_name_as_reported": "Škoda Vrchlabi plant",
        "country_as_reported": "Czech Republic",
        "group_as_reported": "Core brand group",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles",
        "protected_area_names_selected_full_cell_as_reported": [
          "Krkonoše",
          "Vejsplachy",
          "Krkonoše"
        ]
      },
      "19": {
        "source_site_number": 19,
        "physical_page": 4094,
        "printed_page": 443,
        "source_text_sha256": "6662b7fa79d7db8515e111ff306ff3c5be150417b6065a719e6472383f18001c",
        "site_name_as_reported": "Volkswagen Braunschweig plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Volkswagen Group Technology",
        "category": "Production",
        "protected_area_count": 12,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "20": {
        "source_site_number": 20,
        "physical_page": 4094,
        "printed_page": 443,
        "source_text_sha256": "6662b7fa79d7db8515e111ff306ff3c5be150417b6065a719e6472383f18001c",
        "site_name_as_reported": "Volkswagen Chemnitz plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Volkswagen Group Technology",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "21": {
        "source_site_number": 21,
        "physical_page": 4094,
        "printed_page": 443,
        "source_text_sha256": "6662b7fa79d7db8515e111ff306ff3c5be150417b6065a719e6472383f18001c",
        "site_name_as_reported": "Volkswagen Kassel plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Volkswagen Group Technology",
        "category": "Production",
        "protected_area_count": 8,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "Left edge of last column is clipped in PDF in both MuPDF and Poppler; text-layer digit8 partially resembles3. Preserve text-layer8 with qualification; not visually certified as an intact8.",
        "activity": "Manufacture of parts and accessories for motor vehicles",
        "numeric_evidence_basis": "PDF text layer; visual clipping unresolved",
        "protected_area_names_selected_full_cell_as_reported": [
          "City of Kassel",
          "Upper Fulda Valley",
          "Fulda floodplains near Kassel",
          "Baunsberg",
          "Heisebach Valley in Kassel",
          "Dönche",
          "Auenverbund Fulda",
          "Habichtswald forest and Seilerberg near Ehlen"
        ]
      },
      "22": {
        "source_site_number": 22,
        "physical_page": 4095,
        "printed_page": 444,
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "site_name_as_reported": "Volkswagen Martin plant",
        "country_as_reported": "Slovakia",
        "group_as_reported": "Volkswagen Group Technology",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "23": {
        "source_site_number": 23,
        "physical_page": 4095,
        "printed_page": 444,
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "site_name_as_reported": "Volkswagen Salzgitter plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Volkswagen Group Technology",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "24": {
        "source_site_number": 24,
        "physical_page": 4095,
        "printed_page": 444,
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "site_name_as_reported": "Volkswagen São Carlos plant",
        "country_as_reported": "Brazil",
        "group_as_reported": "Volkswagen Group Technology",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "25": {
        "source_site_number": 25,
        "physical_page": 4095,
        "printed_page": 444,
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "site_name_as_reported": "Audi Brussels plant",
        "country_as_reported": "Belgium",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "26": {
        "source_site_number": 26,
        "physical_page": 4095,
        "printed_page": 444,
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "site_name_as_reported": "Audi Györ plant",
        "country_as_reported": "Hungary",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "27": {
        "source_site_number": 27,
        "physical_page": 4095,
        "printed_page": 444,
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "site_name_as_reported": "Audi Ingolstadt plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 7,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "28": {
        "source_site_number": 28,
        "physical_page": 4096,
        "printed_page": 445,
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "site_name_as_reported": "Audi Neckarsulm plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 12,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "29": {
        "source_site_number": 29,
        "physical_page": 4096,
        "printed_page": 445,
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "site_name_as_reported": "Audi Münchsmünster site",
        "country_as_reported": "Germany",
        "group_as_reported": "Progressive brand group",
        "category": "Major operating site",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "30": {
        "source_site_number": 30,
        "physical_page": 4096,
        "printed_page": 445,
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "site_name_as_reported": "Audi Neuburg site",
        "country_as_reported": "Germany",
        "group_as_reported": "Progressive brand group",
        "category": "Major operating site",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles/proving ground"
      },
      "31": {
        "source_site_number": 31,
        "physical_page": 4096,
        "printed_page": 445,
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "site_name_as_reported": "Audi Neustadt site",
        "country_as_reported": "Germany",
        "group_as_reported": "Progressive brand group",
        "category": "Major operating site",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "32": {
        "source_site_number": 32,
        "physical_page": 4096,
        "printed_page": 445,
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "site_name_as_reported": "Lamborghini S’Agata Bolognese plant",
        "country_as_reported": "Italy",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "33": {
        "source_site_number": 33,
        "physical_page": 4096,
        "printed_page": 445,
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "site_name_as_reported": "Bentley Crewe plant",
        "country_as_reported": "United Kingdom of Great Britain and Northern Ireland",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "34": {
        "source_site_number": 34,
        "physical_page": 4097,
        "printed_page": 446,
        "source_text_sha256": "5382b039e17453eeacfa04cbec67cf4bb62e782d89124c55435b452a97f81819",
        "site_name_as_reported": "Ducati Bologna plant",
        "country_as_reported": "Italy",
        "group_as_reported": "Progressive brand group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "35": {
        "source_site_number": 35,
        "physical_page": 4097,
        "printed_page": 446,
        "source_text_sha256": "5382b039e17453eeacfa04cbec67cf4bb62e782d89124c55435b452a97f81819",
        "site_name_as_reported": "Porsche Leipzig plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Sport Luxury brand group",
        "category": "Production",
        "protected_area_count": 7,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "36": {
        "source_site_number": 36,
        "physical_page": 4097,
        "printed_page": 446,
        "source_text_sha256": "5382b039e17453eeacfa04cbec67cf4bb62e782d89124c55435b452a97f81819",
        "site_name_as_reported": "Porsche Stuttgart plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Sport Luxury brand group",
        "category": "Production",
        "protected_area_count": 19,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "37": {
        "source_site_number": 37,
        "physical_page": 4097,
        "printed_page": 446,
        "source_text_sha256": "5382b039e17453eeacfa04cbec67cf4bb62e782d89124c55435b452a97f81819",
        "site_name_as_reported": "Porsche Weissach development center",
        "country_as_reported": "Germany",
        "group_as_reported": "Sport Luxury brand group",
        "category": "Major operating site",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "38": {
        "source_site_number": 38,
        "physical_page": 4097,
        "printed_page": 446,
        "source_text_sha256": "5382b039e17453eeacfa04cbec67cf4bb62e782d89124c55435b452a97f81819",
        "site_name_as_reported": "Everllence Augsburg plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 8,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "39": {
        "source_site_number": 39,
        "physical_page": 4098,
        "printed_page": 447,
        "source_text_sha256": "5e11790f2ed8e305d359b81b6bf3a0ffcfef0353bd16046b537bd4772b4149f9",
        "site_name_as_reported": "Everllence Berlin plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 12,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "40": {
        "source_site_number": 40,
        "physical_page": 4098,
        "printed_page": 447,
        "source_text_sha256": "5e11790f2ed8e305d359b81b6bf3a0ffcfef0353bd16046b537bd4772b4149f9",
        "site_name_as_reported": "Everllence Deggendorf plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 8,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "41": {
        "source_site_number": 41,
        "physical_page": 4098,
        "printed_page": 447,
        "source_text_sha256": "5e11790f2ed8e305d359b81b6bf3a0ffcfef0353bd16046b537bd4772b4149f9",
        "site_name_as_reported": "Everllence Frederikshavn plant",
        "country_as_reported": "Denmark",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery",
        "protected_area_names_selected_full_cell_as_reported": [
          "Hirsholmene",
          "Waters around Hirsholmene",
          "Bangsbo",
          "Bangsbo Bakker",
          "Friderikshavn kommune",
          "Kongehøj Borgbjerg"
        ]
      },
      "42": {
        "source_site_number": 42,
        "physical_page": 4098,
        "printed_page": 447,
        "source_text_sha256": "5e11790f2ed8e305d359b81b6bf3a0ffcfef0353bd16046b537bd4772b4149f9",
        "site_name_as_reported": "Everllence Copenhagen plant",
        "country_as_reported": "Denmark",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 8,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "43": {
        "source_site_number": 43,
        "physical_page": 4098,
        "printed_page": 447,
        "source_text_sha256": "5e11790f2ed8e305d359b81b6bf3a0ffcfef0353bd16046b537bd4772b4149f9",
        "site_name_as_reported": "Everllence Oberhausen plant",
        "country_as_reported": "Germany",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 19,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "44": {
        "source_site_number": 44,
        "physical_page": 4099,
        "printed_page": 448,
        "source_text_sha256": "680681b5826da198a8d62709f58f775fc0ab898f6ec883d621e79b21403e809e",
        "site_name_as_reported": "Everllence Saint-Nazaire plant",
        "country_as_reported": "France",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 5,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "45": {
        "source_site_number": 45,
        "physical_page": 4099,
        "printed_page": 448,
        "source_text_sha256": "680681b5826da198a8d62709f58f775fc0ab898f6ec883d621e79b21403e809e",
        "site_name_as_reported": "Everllence Zürich plant",
        "country_as_reported": "Switzerland",
        "group_as_reported": "Everllence",
        "category": "Production",
        "protected_area_count": 7,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of special-purpose machinery"
      },
      "46": {
        "source_site_number": 46,
        "physical_page": 4099,
        "printed_page": 448,
        "source_text_sha256": "680681b5826da198a8d62709f58f775fc0ab898f6ec883d621e79b21403e809e",
        "site_name_as_reported": "Tianjin (VWPF + VWATJ)",
        "country_as_reported": "China",
        "group_as_reported": "China",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles; Manufacture of parts and accessories for motor vehicles"
      },
      "47": {
        "source_site_number": 47,
        "physical_page": 4100,
        "printed_page": 449,
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "site_name_as_reported": "Scania Angers plant",
        "country_as_reported": "France",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "48": {
        "source_site_number": 48,
        "physical_page": 4100,
        "printed_page": 449,
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "site_name_as_reported": "Scania Gdansk plant",
        "country_as_reported": "Poland",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "49": {
        "source_site_number": 49,
        "physical_page": 4100,
        "printed_page": 449,
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "site_name_as_reported": "Scania Luleã plant",
        "country_as_reported": "Sweden",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "50": {
        "source_site_number": 50,
        "physical_page": 4100,
        "printed_page": 449,
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "site_name_as_reported": "Scania Meppel plant",
        "country_as_reported": "Netherlands",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "51": {
        "source_site_number": 51,
        "physical_page": 4100,
        "printed_page": 449,
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "site_name_as_reported": "Scania São Paulo plant",
        "country_as_reported": "Brazil",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "52": {
        "source_site_number": 52,
        "physical_page": 4100,
        "printed_page": 449,
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "site_name_as_reported": "Scania Sinoform plant",
        "country_as_reported": "China",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles; Manufacture of parts and accessories for motor vehicles"
      },
      "53": {
        "source_site_number": 53,
        "physical_page": 4101,
        "printed_page": 450,
        "source_text_sha256": "471862c98f12fc1d3c2709fe6155f7e388c5c26f56ac92546e5f15728e6a9f6f",
        "site_name_as_reported": "Scania Slupsk plant",
        "country_as_reported": "Poland",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "54": {
        "source_site_number": 54,
        "physical_page": 4101,
        "printed_page": 450,
        "source_text_sha256": "471862c98f12fc1d3c2709fe6155f7e388c5c26f56ac92546e5f15728e6a9f6f",
        "site_name_as_reported": "Scania Södertälje plant",
        "country_as_reported": "Sweden",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "55": {
        "source_site_number": 55,
        "physical_page": 4101,
        "printed_page": 450,
        "source_text_sha256": "471862c98f12fc1d3c2709fe6155f7e388c5c26f56ac92546e5f15728e6a9f6f",
        "site_name_as_reported": "Scania Zwolle plant",
        "country_as_reported": "Netherlands",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "56": {
        "source_site_number": 56,
        "physical_page": 4101,
        "printed_page": 450,
        "source_text_sha256": "471862c98f12fc1d3c2709fe6155f7e388c5c26f56ac92546e5f15728e6a9f6f",
        "site_name_as_reported": "MAN T&B Banovce plant",
        "country_as_reported": "Slovakia",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles",
        "protected_area_names_selected_full_cell_as_reported": [
          "Dubnicka",
          "Strážovské vrchy",
          "Rokos"
        ]
      },
      "57": {
        "source_site_number": 57,
        "physical_page": 4101,
        "printed_page": 450,
        "source_text_sha256": "471862c98f12fc1d3c2709fe6155f7e388c5c26f56ac92546e5f15728e6a9f6f",
        "site_name_as_reported": "MAN T&B Kraków plant",
        "country_as_reported": "Poland",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "58": {
        "source_site_number": 58,
        "physical_page": 4102,
        "printed_page": 451,
        "source_text_sha256": "a6c43a3e180464343b27042adac86ab268ecfd61cc3539eb28ad8a70d26c591b",
        "site_name_as_reported": "MAN T&B Munich plant",
        "country_as_reported": "Germany",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 10,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "59": {
        "source_site_number": 59,
        "physical_page": 4102,
        "printed_page": 451,
        "source_text_sha256": "a6c43a3e180464343b27042adac86ab268ecfd61cc3539eb28ad8a70d26c591b",
        "site_name_as_reported": "MAN T&B Nuremberg plant",
        "country_as_reported": "Germany",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 10,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "60": {
        "source_site_number": 60,
        "physical_page": 4102,
        "printed_page": 451,
        "source_text_sha256": "a6c43a3e180464343b27042adac86ab268ecfd61cc3539eb28ad8a70d26c591b",
        "site_name_as_reported": "MAN T&B Olifantsfontein plant",
        "country_as_reported": "South Africa",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "61": {
        "source_site_number": 61,
        "physical_page": 4102,
        "printed_page": 451,
        "source_text_sha256": "a6c43a3e180464343b27042adac86ab268ecfd61cc3539eb28ad8a70d26c591b",
        "site_name_as_reported": "MAN Pinetown plant",
        "country_as_reported": "South Africa",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 5,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "62": {
        "source_site_number": 62,
        "physical_page": 4102,
        "printed_page": 451,
        "source_text_sha256": "a6c43a3e180464343b27042adac86ab268ecfd61cc3539eb28ad8a70d26c591b",
        "site_name_as_reported": "MAN Salzgitter plant",
        "country_as_reported": "Germany",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "63": {
        "source_site_number": 63,
        "physical_page": 4103,
        "printed_page": 452,
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "site_name_as_reported": "MAN Starachowice plant",
        "country_as_reported": "Poland",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "64": {
        "source_site_number": 64,
        "physical_page": 4103,
        "printed_page": 452,
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "site_name_as_reported": "International Motors Huntsville plant",
        "country_as_reported": "USA",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "M",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of parts and accessories for motor vehicles"
      },
      "65": {
        "source_site_number": 65,
        "physical_page": 4103,
        "printed_page": 452,
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "site_name_as_reported": "International Motors San Antonio plant",
        "country_as_reported": "USA",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 4,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles; Manufacture of parts and accessories for motor vehicles"
      },
      "66": {
        "source_site_number": 66,
        "physical_page": 4103,
        "printed_page": 452,
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "site_name_as_reported": "International Motors Springfield plant",
        "country_as_reported": "USA",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 3,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "67": {
        "source_site_number": 67,
        "physical_page": 4103,
        "printed_page": 452,
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "site_name_as_reported": "International Motors Tulsa plant",
        "country_as_reported": "USA",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 1,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      },
      "68": {
        "source_site_number": 68,
        "physical_page": 4103,
        "printed_page": 452,
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "site_name_as_reported": "Volkswagen Truck & Bus Resende plant",
        "country_as_reported": "Brazil",
        "group_as_reported": "TRATON Group",
        "category": "Production",
        "protected_area_count": 2,
        "count_unit": "reported protected areas associated with this site",
        "radius": 4500,
        "radius_unit": "m",
        "measurement": "ENCORE potential impact/dependency screening; not measured biodiversity damage",
        "period": "2025 sustainability report annex",
        "disruption_impact_rating": "VH",
        "toxic_soil_water_impact_rating": "M",
        "rating_scale": {
          "M": "medium",
          "H": "high",
          "VH": "very high"
        },
        "counts_are_globally_unique": false,
        "visual_review": "full page inspected; selected numeric and category fields checked",
        "activity": "Manufacture of motor vehicles"
      }
    },
    "palmela_independent_check": {
      "physical_page": 4092,
      "printed_page": 441,
      "source_site_number": 9,
      "site_name_as_reported": "Volkswagen Palmela plant",
      "country_as_reported": "Great Britain and Northern Ireland",
      "independent_visual_result": "Country wording is printed directly inside the Palmela column; no row-wrap ambiguity.",
      "corroborated_country": "Portugal",
      "corroboration_url": "https://www.volkswagen-group.com/en/articles/world-premiere-of-the-t-roc-new-generation-of-the-best-seller-is-high-quality-and-innovative-19773",
      "corroboration_date": "2025-08-27",
      "corroboration_kind": "Volkswagen official press release identifies Portuguese plant in Palmela near Lisbon",
      "source_label_replaced": false,
      "coverage_counted_here": false
    },
    "aggregation": {
      "sum_meaning": "sum of site-associated reported counts only, not unique protected areas",
      "unique_global_protected_areas": null,
      "unique_global_status": "not_derivable_from_these_tables"
    },
    "assurance": "part of overall limited-assurance sustainability statement; not part of named reasonable-assurance subset"
  },
  "sustainability": {
    "schema_version": 1,
    "company": "Volkswagen",
    "report_year": 2025,
    "purpose": "Report-grounded source tables and offline demo controls; no professional audit assurance",
    "source_pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "source_mapping": "physical page = printed page +3651",
    "facts": {
      "dci.2018": {
        "value": 51.6,
        "unit": "tCO2e/vehicle",
        "period": "2018",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable for DCI 2024–25 and BYR 2020–24; limited for 2018–19",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": true
      },
      "dci.2019": {
        "value": 52.7,
        "unit": "tCO2e/vehicle",
        "period": "2019",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable for DCI 2024–25 and BYR 2020–24; limited for 2018–19",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": true
      },
      "dci.2020": {
        "value": 52.6,
        "unit": "tCO2e/vehicle",
        "period": "2020",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: named DCI/BYR disclosures only",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": false
      },
      "dci.2021": {
        "value": 50.7,
        "unit": "tCO2e/vehicle",
        "period": "2021",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: named DCI/BYR disclosures only",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": false
      },
      "dci.2022": {
        "value": 50.3,
        "unit": "tCO2e/vehicle",
        "period": "2022",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: named DCI/BYR disclosures only",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": false
      },
      "dci.2023": {
        "value": 49.5,
        "unit": "tCO2e/vehicle",
        "period": "2023",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: named DCI/BYR disclosures only",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": false
      },
      "dci.2024": {
        "value": 48.6,
        "unit": "tCO2e/vehicle",
        "period": "2024",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: named DCI/BYR disclosures only",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": false
      },
      "dci.2025": {
        "value": 46.3,
        "unit": "tCO2e/vehicle",
        "period": "2025",
        "scope": "Passenger cars and light commercial vehicles; EU27+UK+Norway+Iceland, China including JVs, USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: named DCI/BYR disclosures only",
        "basis": "2025 recalculated comparable series",
        "assumed_lifetime_km": 200000,
        "offsets_included": false,
        "maintenance_included": false,
        "simplified_method": false
      },
      "dci.2024.original": {
        "value": 48.0,
        "unit": "tCO2e/vehicle",
        "period": "2024",
        "scope": "Passenger cars and light commercial vehicles; Europe, China and USA",
        "source": {
          "physical_page": 3912,
          "printed_page": 261,
          "text_path": "financial-reference-recovery/pages/page-03912.txt",
          "text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "basis": "previously published; not comparable without recalculation"
      },
      "dci.delta": {
        "value": -2.3,
        "unit": "tCO2e/vehicle",
        "period": "2025 vs restated 2024",
        "scope": "Volkswagen Group",
        "source": {
          "physical_page": 3911,
          "printed_page": 260,
          "text_path": "financial-reference-recovery/pages/page-03911.txt",
          "text_sha256": "e1f465b9678349b13efecc4bb5059331016d88c5e8668424abbb0bf70ce897ae",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "plan.group_esrs_e1_16": {
        "value": false,
        "unit": "boolean",
        "period": "2025",
        "scope": "Entire Volkswagen Group",
        "source": {
          "physical_page": 3903,
          "printed_page": 252,
          "text_path": "financial-reference-recovery/pages/page-03903.txt",
          "text_sha256": "fc10ab024dcb182b148af16335a481add7b15b47d40142cb03d1661a2a2f76ac",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_status",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "target_alignment": "1.5C only for Scope 1+2; Scope 3 target 2C",
        "target_year": null,
        "base_year": null
      },
      "plan.reliable_1_5_pathway": {
        "value": false,
        "unit": "boolean",
        "period": "2025",
        "scope": "Entire Volkswagen Group",
        "source": {
          "physical_page": 3903,
          "printed_page": 252,
          "text_path": "financial-reference-recovery/pages/page-03903.txt",
          "text_sha256": "fc10ab024dcb182b148af16335a481add7b15b47d40142cb03d1661a2a2f76ac",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_status",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "target_alignment": "1.5C only for Scope 1+2; Scope 3 target 2C",
        "target_year": null,
        "base_year": null
      },
      "plan.scope12_target_2030": {
        "value": 50.4,
        "unit": "% reduction from 2018",
        "period": "2025",
        "scope": "Global production, market-based Scope 1+2",
        "source": {
          "physical_page": 3908,
          "printed_page": 257,
          "text_path": "financial-reference-recovery/pages/page-03908.txt",
          "text_sha256": "9d4f5c65f1542574ac20961ab0bd4d8116741d9ebe2d5cac93f80197337c0d92",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "target",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "target_alignment": "1.5C only for Scope 1+2; Scope 3 target 2C",
        "target_year": 2030,
        "base_year": 2018
      },
      "plan.scope12_reduction_2025": {
        "value": 60,
        "unit": "% reduction from 2018",
        "period": "2025",
        "scope": "Global production, market-based Scope 1+2",
        "source": {
          "physical_page": 3908,
          "printed_page": 257,
          "text_path": "financial-reference-recovery/pages/page-03908.txt",
          "text_sha256": "9d4f5c65f1542574ac20961ab0bd4d8116741d9ebe2d5cac93f80197337c0d92",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "target_alignment": "1.5C only for Scope 1+2; Scope 3 target 2C",
        "target_year": null,
        "base_year": 2018
      },
      "plan.scope3_target_2030": {
        "value": 30,
        "unit": "% reduction from 2018",
        "period": "2025",
        "scope": "Passenger cars and light commercial vehicles, use-phase per vehicle-km",
        "source": {
          "physical_page": 3909,
          "printed_page": 258,
          "text_path": "financial-reference-recovery/pages/page-03909.txt",
          "text_sha256": "e033354b9420ff95fb3bd4fd8d7ee12049efc7daaa28bff6d89b77e297c3332a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "target",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "target_alignment": "1.5C only for Scope 1+2; Scope 3 target 2C",
        "target_year": 2030,
        "base_year": 2018
      },
      "taxonomy.revenue.total": {
        "value": 321913,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.eligible": {
        "value": 290952,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.other": {
        "value": 30961,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.substantial": {
        "value": 49988,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.aligned": {
        "value": 34527,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.eligible_share": {
        "value": 90.4,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.aligned_share": {
        "value": 10.7,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.revenue.aligned_within_eligible_share": {
        "value": 11.9,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3992,
          "printed_page": 341,
          "text_path": "financial-reference-recovery/pages/page-03992.txt",
          "text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "eligible",
        "definition": "IFRS sales revenue"
      },
      "taxonomy.capex.total": {
        "value": 69879,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.eligible": {
        "value": 69423,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.other": {
        "value": 456,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.substantial": {
        "value": 27117,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.aligned": {
        "value": 23514,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.eligible_share": {
        "value": 99.3,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.aligned_share": {
        "value": 33.6,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3989,
          "printed_page": 338,
          "text_path": "financial-reference-recovery/pages/page-03989.txt",
          "text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.capex.aligned_within_eligible_share": {
        "value": 33.9,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3992,
          "printed_page": 341,
          "text_path": "financial-reference-recovery/pages/page-03992.txt",
          "text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "eligible",
        "definition": "Intangible, PPE, lease/investment-property additions and business combinations; excludes goodwill"
      },
      "taxonomy.opex.total": {
        "value": 12915,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.eligible": {
        "value": 12511,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.other": {
        "value": 404,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.substantial": {
        "value": 5200,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.aligned": {
        "value": 4972,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.eligible_share": {
        "value": 96.9,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.aligned_share": {
        "value": 38.5,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3990,
          "printed_page": 339,
          "text_path": "financial-reference-recovery/pages/page-03990.txt",
          "text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "total KPI",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.opex.aligned_within_eligible_share": {
        "value": 39.7,
        "unit": "%",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3992,
          "printed_page": 341,
          "text_path": "financial-reference-recovery/pages/page-03992.txt",
          "text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "denominator": "eligible",
        "definition": "Noncapitalized R&D, short-term leases, maintenance and repairs"
      },
      "taxonomy.revenue.activity33.eligible": {
        "value": 290851,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.revenue.activity33.aligned": {
        "value": 34426,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.revenue.activity318.eligible": {
        "value": 101,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.revenue.activity318.aligned": {
        "value": 101,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3988,
          "printed_page": 337,
          "text_path": "financial-reference-recovery/pages/page-03988.txt",
          "text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.revenue.aligned.2024": {
        "value": 24104,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3992,
          "printed_page": 341,
          "text_path": "financial-reference-recovery/pages/page-03992.txt",
          "text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.capex.aligned.2024": {
        "value": 18481,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3992,
          "printed_page": 341,
          "text_path": "financial-reference-recovery/pages/page-03992.txt",
          "text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.opex.aligned.2024": {
        "value": 5448,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Consolidated IFRS Group; Chinese JVs excluded",
        "source": {
          "physical_page": 3992,
          "printed_page": 341,
          "text_path": "financial-reference-recovery/pages/page-03992.txt",
          "text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "reasonable: EU Taxonomy disclosures"
      },
      "taxonomy.plan.current_capex": {
        "value": 7,
        "unit": "EUR billion",
        "period": "2025",
        "scope": "Vehicle-related activity 3.3; excludes existing aligned lease additions",
        "source": {
          "physical_page": 3991,
          "printed_page": 340,
          "text_path": "financial-reference-recovery/pages/page-03991.txt",
          "text_sha256": "251a02f5020438d0a731a18653797074f1fa67d8c6a84aca6bbd439b5e17875e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "plan_allocation",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "period_horizon": "Reporting year"
      },
      "taxonomy.plan.current_opex": {
        "value": 2,
        "unit": "EUR billion",
        "period": "2025",
        "scope": "Vehicle-related activity 3.3; excludes existing aligned lease additions",
        "source": {
          "physical_page": 3991,
          "printed_page": 340,
          "text_path": "financial-reference-recovery/pages/page-03991.txt",
          "text_sha256": "251a02f5020438d0a731a18653797074f1fa67d8c6a84aca6bbd439b5e17875e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "plan_allocation",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "period_horizon": "Reporting year"
      },
      "taxonomy.plan.expected_total": {
        "value": 66,
        "unit": "EUR billion",
        "period": "2025",
        "scope": "Vehicle-related activity 3.3; excludes existing aligned lease additions",
        "source": {
          "physical_page": 3991,
          "printed_page": 340,
          "text_path": "financial-reference-recovery/pages/page-03991.txt",
          "text_sha256": "251a02f5020438d0a731a18653797074f1fa67d8c6a84aca6bbd439b5e17875e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "forecast",
        "assurance": "reasonable: EU Taxonomy disclosures",
        "period_horizon": "Reporting period plus five-year medium-term planning"
      },
      "energy.total.group.2025": {
        "value": 19.2,
        "unit": "million MWh",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.total.operational_control_addition.2025": {
        "value": 5.1,
        "unit": "million MWh",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.total.group.2024": {
        "value": 19.0,
        "unit": "million MWh",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.total.operational_control_addition.2024": {
        "value": 5.5,
        "unit": "million MWh",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.fossil.group.2025": {
        "value": 11.4,
        "unit": "million MWh",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.fossil.operational_control_addition.2025": {
        "value": 3.4,
        "unit": "million MWh",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.fossil.group.2024": {
        "value": 11.9,
        "unit": "million MWh",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.fossil.operational_control_addition.2024": {
        "value": 3.7,
        "unit": "million MWh",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.nuclear.group.2025": {
        "value": 0.04,
        "unit": "million MWh",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.nuclear.operational_control_addition.2025": {
        "value": 0.1,
        "unit": "million MWh",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.nuclear.group.2024": {
        "value": 0.04,
        "unit": "million MWh",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.nuclear.operational_control_addition.2024": {
        "value": 0.1,
        "unit": "million MWh",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.renewable.group.2025": {
        "value": 7.8,
        "unit": "million MWh",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.renewable.operational_control_addition.2025": {
        "value": 1.6,
        "unit": "million MWh",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.renewable.group.2024": {
        "value": 7.1,
        "unit": "million MWh",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.renewable.operational_control_addition.2024": {
        "value": 1.7,
        "unit": "million MWh",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.purchased_renewable_electric.group.2025": {
        "value": 5.5,
        "unit": "million MWh",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.purchased_renewable_electric.operational_control_addition.2025": {
        "value": 1.1,
        "unit": "million MWh",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.purchased_renewable_electric.group.2024": {
        "value": 5.7,
        "unit": "million MWh",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.purchased_renewable_electric.operational_control_addition.2024": {
        "value": 1.1,
        "unit": "million MWh",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": false
      },
      "energy.bundled_share.group.2025": {
        "value": 90.3,
        "unit": "%",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.bundled_share.operational_control_addition.2025": {
        "value": 18.3,
        "unit": "%",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.bundled_share.group.2024": {
        "value": 65.4,
        "unit": "%",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.bundled_share.operational_control_addition.2024": {
        "value": 0.9,
        "unit": "%",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.unbundled_share.group.2025": {
        "value": 9.7,
        "unit": "%",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.unbundled_share.operational_control_addition.2025": {
        "value": 81.7,
        "unit": "%",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.unbundled_share.group.2024": {
        "value": 34.6,
        "unit": "%",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.unbundled_share.operational_control_addition.2024": {
        "value": 99.1,
        "unit": "%",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "excludes_traton": true
      },
      "energy.total.combined.2025": {
        "value": 24.3,
        "unit": "million MWh",
        "period": "2025",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "energy.total.combined.2024": {
        "value": 24.6,
        "unit": "million MWh",
        "period": "2024",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "energy.intensity.2025": {
        "value": 0.06,
        "unit": "kWh/EUR",
        "period": "2025",
        "scope": "Group excluding operational-control addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "energy.intensity.2024": {
        "value": 0.059,
        "unit": "kWh/EUR",
        "period": "2024",
        "scope": "Group excluding operational-control addition",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "revenue.2025": {
        "value": 321913,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Consolidated IFRS Group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "revenue.2024": {
        "value": 324656,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Consolidated IFRS Group",
        "source": {
          "physical_page": 3921,
          "printed_page": 270,
          "text_path": "financial-reference-recovery/pages/page-03921.txt",
          "text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope1.group.2025": {
        "value": 2.4,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope1.operational_control_addition.2025": {
        "value": 0.3,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope1.group.2024": {
        "value": 3.0,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope1.operational_control_addition.2024": {
        "value": 0.3,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_location.group.2025": {
        "value": 2.6,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_location.operational_control_addition.2025": {
        "value": 1.4,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_location.group.2024": {
        "value": 2.6,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_location.operational_control_addition.2024": {
        "value": 1.6,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_market.group.2025": {
        "value": 0.4,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_market.operational_control_addition.2025": {
        "value": 0.6,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_market.group.2024": {
        "value": 0.5,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_market.operational_control_addition.2024": {
        "value": 0.7,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope1.combined.2025": {
        "value": 2.7,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope1.combined.2024": {
        "value": 3.3,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_location.combined.2025": {
        "value": 4.0,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_location.combined.2024": {
        "value": 4.2,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_market.combined.2025": {
        "value": 0.9,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ghg.scope2_market.combined.2024": {
        "value": 1.1,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group plus operationally controlled companies",
        "source": {
          "physical_page": 3923,
          "printed_page": 272,
          "text_path": "financial-reference-recovery/pages/page-03923.txt",
          "text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "scope3.cat1.2025": {
        "value": 104.44,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat1.2024": {
        "value": 99.95,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat2.2025": {
        "value": 8.33,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat2.2024": {
        "value": 9.71,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat3.2025": {
        "value": 1.29,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat3.2024": {
        "value": 1.34,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat4.2025": {
        "value": 6.73,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Passenger-car logistics/franchises use previous-year emissions"
      },
      "scope3.cat4.2024": {
        "value": 7.75,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Passenger-car logistics/franchises use previous-year emissions"
      },
      "scope3.cat5.2025": {
        "value": 1.64,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat5.2024": {
        "value": 1.28,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat6.2025": {
        "value": 0.22,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat6.2024": {
        "value": 0.22,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat7.2025": {
        "value": 0.31,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat7.2024": {
        "value": 0.33,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat8.2025": {
        "value": 0.18,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat8.2024": {
        "value": 0.14,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat9.2025": {
        "value": null,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "included_in_category_4",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat9.2024": {
        "value": null,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "included_in_category_4",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat10.2025": {
        "value": 0.2,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat10.2024": {
        "value": 0.2,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat11.2025": {
        "value": 752.57,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat11.2024": {
        "value": 695.16,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat12.2025": {
        "value": 0.91,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat12.2024": {
        "value": 1.15,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat13.2025": {
        "value": 4.42,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat13.2024": {
        "value": 4.23,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat14.2025": {
        "value": 2.49,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Passenger-car logistics/franchises use previous-year emissions"
      },
      "scope3.cat14.2024": {
        "value": 2.54,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Passenger-car logistics/franchises use previous-year emissions"
      },
      "scope3.cat15.2025": {
        "value": 0.01,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.cat15.2024": {
        "value": 0.01,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs; category-specific methods/perimeters",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported",
        "comparative_basis": "recalculated where indicated",
        "period_caveat": "Category-specific production/sales/commissioning and lifetime assumptions"
      },
      "scope3.total.2025": {
        "value": 883.74,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group including Chinese JVs",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "2024 recalculated",
        "known_double_count": "MAN light commercial vehicles overlap passenger and commercial areas"
      },
      "scope3.total.2024": {
        "value": 824.0,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "2024 recalculated",
        "known_double_count": "MAN light commercial vehicles overlap passenger and commercial areas"
      },
      "scope3.total.2024.original": {
        "value": 812.01,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group including Chinese JVs",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "before recalculation"
      },
      "scope3.area.passenger.2025": {
        "value": 386.53,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "passenger",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "exhaustive_partition": false
      },
      "scope3.area.passenger.2024": {
        "value": 398.76,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "passenger",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "exhaustive_partition": false
      },
      "scope3.area.commercial.2025": {
        "value": 304.91,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "commercial",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "exhaustive_partition": false
      },
      "scope3.area.commercial.2024": {
        "value": 357.82,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "commercial",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "exhaustive_partition": false
      },
      "scope3.area.power.2025": {
        "value": 178.71,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "power",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "exhaustive_partition": false
      },
      "scope3.area.power.2024": {
        "value": 50.16,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "power",
        "source": {
          "physical_page": 3924,
          "printed_page": 273,
          "text_path": "financial-reference-recovery/pages/page-03924.txt",
          "text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "exhaustive_partition": false
      },
      "ghg.total.location.2025": {
        "value": 890.4,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group plus operational-control addition; Scope 3 includes Chinese JVs",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "2024 adjusted"
      },
      "ghg.intensity.location.2025": {
        "value": 2.3,
        "unit": "kgCO2e/EUR",
        "period": "2025",
        "scope": "Excludes operationally controlled companies",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "numerator_bridge": "not disclosed sufficiently for recomputation from displayed total"
      },
      "ghg.total.location.2024": {
        "value": 831.5,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group plus operational-control addition; Scope 3 includes Chinese JVs",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "2024 adjusted"
      },
      "ghg.intensity.location.2024": {
        "value": 2.1,
        "unit": "kgCO2e/EUR",
        "period": "2024",
        "scope": "Excludes operationally controlled companies",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "numerator_bridge": "not disclosed sufficiently for recomputation from displayed total"
      },
      "ghg.total.market.2025": {
        "value": 887.4,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Group plus operational-control addition; Scope 3 includes Chinese JVs",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "2024 adjusted"
      },
      "ghg.intensity.market.2025": {
        "value": 2.3,
        "unit": "kgCO2e/EUR",
        "period": "2025",
        "scope": "Excludes operationally controlled companies",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "numerator_bridge": "not disclosed sufficiently for recomputation from displayed total"
      },
      "ghg.total.market.2024": {
        "value": 828.5,
        "unit": "million tCO2e",
        "period": "2024",
        "scope": "Group plus operational-control addition; Scope 3 includes Chinese JVs",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparative_basis": "2024 adjusted"
      },
      "ghg.intensity.market.2024": {
        "value": 2.1,
        "unit": "kgCO2e/EUR",
        "period": "2024",
        "scope": "Excludes operationally controlled companies",
        "source": {
          "physical_page": 3930,
          "printed_page": 279,
          "text_path": "financial-reference-recovery/pages/page-03930.txt",
          "text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "numerator_bridge": "not disclosed sufficiently for recomputation from displayed total"
      },
      "credits.total.2025": {
        "value": 680379,
        "unit": "tCO2e",
        "period": "2025",
        "scope": "Credits cancelled in reporting year",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited; certificate existence considered, effectiveness excluded by assurance report physical4312",
        "certificate_effectiveness_assured": false,
        "precision": "whole tonnes"
      },
      "credits.verra.2025": {
        "value": 383784,
        "unit": "tCO2e",
        "period": "2025",
        "scope": "Credits cancelled in reporting year",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited; certificate existence considered, effectiveness excluded by assurance report physical4312",
        "certificate_effectiveness_assured": false,
        "precision": "whole tonnes"
      },
      "credits.gold.2025": {
        "value": 296595,
        "unit": "tCO2e",
        "period": "2025",
        "scope": "Credits cancelled in reporting year",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited; certificate existence considered, effectiveness excluded by assurance report physical4312",
        "certificate_effectiveness_assured": false,
        "precision": "whole tonnes"
      },
      "credits.total.2024": {
        "value": 6076738,
        "unit": "tCO2e",
        "period": "2024",
        "scope": "Credits cancelled in reporting year",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited; certificate existence considered, effectiveness excluded by assurance report physical4312",
        "certificate_effectiveness_assured": false,
        "precision": "whole tonnes"
      },
      "credits.verra.2024": {
        "value": 4232578,
        "unit": "tCO2e",
        "period": "2024",
        "scope": "Credits cancelled in reporting year",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited; certificate existence considered, effectiveness excluded by assurance report physical4312",
        "certificate_effectiveness_assured": false,
        "precision": "whole tonnes"
      },
      "credits.gold.2024": {
        "value": 1844460,
        "unit": "tCO2e",
        "period": "2024",
        "scope": "Credits cancelled in reporting year",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited; certificate existence considered, effectiveness excluded by assurance report physical4312",
        "certificate_effectiveness_assured": false,
        "precision": "whole tonnes"
      },
      "credits.repeated_label.1": {
        "value": 0,
        "unit": "%",
        "period": "2025",
        "scope": "Reported table row",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "label": "Share of projects to reduce CO2 emissions",
        "status": "ambiguous_duplicate_source_label"
      },
      "credits.repeated_label.2": {
        "value": 100,
        "unit": "%",
        "period": "2025",
        "scope": "Reported table row",
        "source": {
          "physical_page": 3931,
          "printed_page": 280,
          "text_path": "financial-reference-recovery/pages/page-03931.txt",
          "text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "label": "Share of projects to reduce CO2 emissions",
        "status": "ambiguous_duplicate_source_label"
      },
      "water.consumption.group.2025": {
        "value": 7.5,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "2024 consumption corrected"
      },
      "water.consumption.operational_control_addition.2025": {
        "value": 4.9,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "2024 consumption corrected"
      },
      "water.consumption.group.2024": {
        "value": 7.7,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "2024 consumption corrected"
      },
      "water.consumption.operational_control_addition.2024": {
        "value": 5.0,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "2024 consumption corrected"
      },
      "water.risk_consumption.group.2025": {
        "value": 2.8,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.risk_consumption.operational_control_addition.2025": {
        "value": 3.0,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.risk_consumption.group.2024": {
        "value": 2.6,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.risk_consumption.operational_control_addition.2024": {
        "value": 3.1,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.withdrawal.group.2025": {
        "value": 19.9,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.withdrawal.operational_control_addition.2025": {
        "value": 11.6,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.withdrawal.group.2024": {
        "value": 21.2,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.withdrawal.operational_control_addition.2024": {
        "value": 13.2,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.risk_withdrawal.group.2025": {
        "value": 4.5,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.risk_withdrawal.operational_control_addition.2025": {
        "value": 8.5,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.risk_withdrawal.group.2024": {
        "value": 4.4,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.risk_withdrawal.operational_control_addition.2024": {
        "value": 10.2,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.discharge.group.2025": {
        "value": 12.1,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.discharge.operational_control_addition.2025": {
        "value": 6.7,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.discharge.group.2024": {
        "value": 13.9,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.discharge.operational_control_addition.2024": {
        "value": 8.2,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.risk_discharge.group.2025": {
        "value": 1.9,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.risk_discharge.operational_control_addition.2025": {
        "value": 5.5,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.risk_discharge.group.2024": {
        "value": 2.0,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.risk_discharge.operational_control_addition.2024": {
        "value": 7.1,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "not externally validated per footnote 2",
        "excludes_traton": true,
        "comparative_basis": "as reported"
      },
      "water.reuse.group.2025": {
        "value": 2.8,
        "unit": "million m3",
        "period": "2025",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.reuse.operational_control_addition.2025": {
        "value": 1.2,
        "unit": "million m3",
        "period": "2025",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.reuse.group.2024": {
        "value": 2.7,
        "unit": "million m3",
        "period": "2024",
        "scope": "group",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "water.reuse.operational_control_addition.2024": {
        "value": 1.1,
        "unit": "million m3",
        "period": "2024",
        "scope": "operational_control_addition",
        "source": {
          "physical_page": 3953,
          "printed_page": 302,
          "text_path": "financial-reference-recovery/pages/page-03953.txt",
          "text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "external_validation": "No footnote 2 exclusion on this row; overall limited assurance context",
        "excludes_traton": false,
        "comparative_basis": "as reported"
      },
      "bli.2025": {
        "value": 53.4,
        "unit": "%",
        "period": "2025",
        "scope": "Passenger/light-commercial and component production sites",
        "source": {
          "physical_page": 3962,
          "printed_page": 311,
          "text_path": "financial-reference-recovery/pages/page-03962.txt",
          "text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparable": false,
        "method_change": "2025 permits exceptional ecologically valuable areas beyond30km; two Mexican sites add existing land"
      },
      "bli.2024": {
        "value": 28.6,
        "unit": "%",
        "period": "2024",
        "scope": "Passenger/light-commercial and component production sites",
        "source": {
          "physical_page": 3962,
          "printed_page": 311,
          "text_path": "financial-reference-recovery/pages/page-03962.txt",
          "text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "comparable": false,
        "method_change": "2025 permits exceptional ecologically valuable areas beyond30km; two Mexican sites add existing land"
      },
      "biodiversity.sites.2025": {
        "value": 68,
        "unit": "sites",
        "period": "2025",
        "scope": "Sites within4.5km of protected areas",
        "source": {
          "physical_page": 3962,
          "printed_page": 311,
          "text_path": "financial-reference-recovery/pages/page-03962.txt",
          "text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "interpretation": "proximity and potential impacts; not count of adverse incidents"
      },
      "biodiversity.area.2025": {
        "value": 9296,
        "unit": "hectares",
        "period": "2025",
        "scope": "Sites within4.5km of protected areas",
        "source": {
          "physical_page": 3962,
          "printed_page": 311,
          "text_path": "financial-reference-recovery/pages/page-03962.txt",
          "text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "interpretation": "proximity and potential impacts; not count of adverse incidents"
      },
      "biodiversity.sites.2024": {
        "value": 58,
        "unit": "sites",
        "period": "2024",
        "scope": "Sites within4.5km of protected areas",
        "source": {
          "physical_page": 3962,
          "printed_page": 311,
          "text_path": "financial-reference-recovery/pages/page-03962.txt",
          "text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "interpretation": "proximity and potential impacts; not count of adverse incidents"
      },
      "biodiversity.area.2024": {
        "value": 8653,
        "unit": "hectares",
        "period": "2024",
        "scope": "Sites within4.5km of protected areas",
        "source": {
          "physical_page": 3962,
          "printed_page": 311,
          "text_path": "financial-reference-recovery/pages/page-03962.txt",
          "text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "interpretation": "proximity and potential impacts; not count of adverse incidents"
      },
      "workforce.gender.male.2025": {
        "value": 478929,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.female.2025": {
        "value": 123664,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.other.2025": {
        "value": 37,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.undisclosed.2025": {
        "value": 29,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.total.2025": {
        "value": 602659,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.male.2024": {
        "value": 489917,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.female.2024": {
        "value": 124125,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.other.2024": {
        "value": 7,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.undisclosed.2024": {
        "value": 33,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.gender.total.2024": {
        "value": 614082,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees; excludes Chinese JVs and dormant/academic employees",
        "source": {
          "physical_page": 4008,
          "printed_page": 357,
          "text_path": "financial-reference-recovery/pages/page-04008.txt",
          "text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.contract.undisclosed.2024": {
        "value": 0,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "Contract table employees row",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "conflicts with gender table and permanent-contract row"
      },
      "workforce.contract.permanent.2025": {
        "value": 586402,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported"
      },
      "workforce.contract.temporary.2025": {
        "value": 16257,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported"
      },
      "workforce.contract.full_time.2025": {
        "value": 556958,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported"
      },
      "workforce.contract.part_time.2025": {
        "value": 45701,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported"
      },
      "workforce.contract.permanent.2024": {
        "value": 591137,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported"
      },
      "workforce.contract.temporary.2024": {
        "value": 22945,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "reported"
      },
      "workforce.contract.full_time.2024": {
        "value": null,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "source_dash"
      },
      "workforce.contract.part_time.2024": {
        "value": null,
        "unit": "headcount",
        "period": "2024-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "source_dash"
      },
      "workforce.market.germany": {
        "value": 284032,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4011,
          "printed_page": 360,
          "text_path": "financial-reference-recovery/pages/page-04011.txt",
          "text_sha256": "53218a6a7e325d5b56f29676bc452199e9eff5ddf3bd0be4d63544b791a4ec69",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.market.europe_other": {
        "value": 203449,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4011,
          "printed_page": 360,
          "text_path": "financial-reference-recovery/pages/page-04011.txt",
          "text_sha256": "53218a6a7e325d5b56f29676bc452199e9eff5ddf3bd0be4d63544b791a4ec69",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.market.north_america": {
        "value": 44815,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4011,
          "printed_page": 360,
          "text_path": "financial-reference-recovery/pages/page-04011.txt",
          "text_sha256": "53218a6a7e325d5b56f29676bc452199e9eff5ddf3bd0be4d63544b791a4ec69",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.market.south_america": {
        "value": 32004,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4011,
          "printed_page": 360,
          "text_path": "financial-reference-recovery/pages/page-04011.txt",
          "text_sha256": "53218a6a7e325d5b56f29676bc452199e9eff5ddf3bd0be4d63544b791a4ec69",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.market.asia_pacific": {
        "value": 38309,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "ESRS employees",
        "source": {
          "physical_page": 4011,
          "printed_page": 360,
          "text_path": "financial-reference-recovery/pages/page-04011.txt",
          "text_sha256": "53218a6a7e325d5b56f29676bc452199e9eff5ddf3bd0be4d63544b791a4ec69",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "workforce.map.europe_other": {
        "value": 203499,
        "unit": "headcount",
        "period": "2025-12-31",
        "scope": "Map label",
        "source": {
          "physical_page": 4010,
          "printed_page": 359,
          "text_path": "financial-reference-recovery/pages/page-04010.txt",
          "text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "status": "source conflicts with adjacent market table"
      },
      "kpi.training_hours": {
        "value": 21.6,
        "unit": "hours/employee",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4012,
          "printed_page": 361,
          "text_path": "financial-reference-recovery/pages/page-04012.txt",
          "text_sha256": "b77a7af4d18639dfda638c3f3d8902e9c12331df9ceaabfe47c9eb72d785f6fa",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Strategic training KPI suspended2025/26, ESRS metric still reported"
      },
      "kpi.ltifr": {
        "value": 6.2,
        "unit": "lost-day accidents per million hours",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4014,
          "printed_page": 363,
          "text_path": "financial-reference-recovery/pages/page-04014.txt",
          "text_sha256": "70a7301a69b34b9b3572e9b2fbef29885e883fb2b5dfbb026259c04eaad1994b",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.trir": {
        "value": 10.8,
        "unit": "recordable accidents per million hours",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.fatalities_all": {
        "value": 4,
        "unit": "persons",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.fatalities_employees": {
        "value": 1,
        "unit": "persons",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.fatalities_nonemployees": {
        "value": 1,
        "unit": "persons",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.fatalities_other_workers": {
        "value": 2,
        "unit": "persons",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.iso45001_coverage": {
        "value": 87,
        "unit": "%",
        "period": "2025",
        "scope": "Employees at production sites>1000employees including Chinese JVs",
        "source": {
          "physical_page": 4014,
          "printed_page": 363,
          "text_path": "financial-reference-recovery/pages/page-04014.txt",
          "text_sha256": "70a7301a69b34b9b3572e9b2fbef29885e883fb2b5dfbb026259c04eaad1994b",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.all_hs_coverage": {
        "value": 82,
        "unit": "%",
        "period": "2025",
        "scope": "All employees under ESRS reporting scope",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.external_hs_coverage": {
        "value": 55,
        "unit": "%",
        "period": "2025",
        "scope": "All employees under ESRS reporting scope",
        "source": {
          "physical_page": 4015,
          "printed_page": 364,
          "text_path": "financial-reference-recovery/pages/page-04015.txt",
          "text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.unadjusted_pay_gap": {
        "value": 9,
        "unit": "%",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4018,
          "printed_page": 367,
          "text_path": "financial-reference-recovery/pages/page-04018.txt",
          "text_sha256": "0ba763e0eb114e74e78302b1bc920e394cac7f10863808f51be736732912a3d5",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.top_management_female_share": {
        "value": 13.3,
        "unit": "%",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4018,
          "printed_page": 367,
          "text_path": "financial-reference-recovery/pages/page-04018.txt",
          "text_sha256": "0ba763e0eb114e74e78302b1bc920e394cac7f10863808f51be736732912a3d5",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.diversity_index": {
        "value": 168,
        "unit": "points",
        "period": "2025",
        "scope": "Strategic management metric including ChinaJVs but excluding specified US-related employees; prior-year not restated",
        "source": {
          "physical_page": 4018,
          "printed_page": 367,
          "text_path": "financial-reference-recovery/pages/page-04018.txt",
          "text_sha256": "0ba763e0eb114e74e78302b1bc920e394cac7f10863808f51be736732912a3d5",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.positive_supplier_weighted_share": {
        "value": 87,
        "unit": "%",
        "period": "2025",
        "scope": "Relevant direct suppliers weighted by total procurement volume",
        "source": {
          "physical_page": 4037,
          "printed_page": 386,
          "text_path": "financial-reference-recovery/pages/page-04037.txt",
          "text_sha256": "ae455d09b1a0e0cdc1879bb99dc19b3bac686156ae25b101daf34fd5562d53ea",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.supplier_ratings": {
        "value": 16218,
        "unit": "suppliers",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4037,
          "printed_page": 386,
          "text_path": "financial-reference-recovery/pages/page-04037.txt",
          "text_sha256": "ae455d09b1a0e0cdc1879bb99dc19b3bac686156ae25b101daf34fd5562d53ea",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.positive_supplier_ratings": {
        "value": 16178,
        "unit": "suppliers",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4037,
          "printed_page": 386,
          "text_path": "financial-reference-recovery/pages/page-04037.txt",
          "text_sha256": "ae455d09b1a0e0cdc1879bb99dc19b3bac686156ae25b101daf34fd5562d53ea",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.supplier_grievance_reports": {
        "value": 180,
        "unit": "unverified reports",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4037,
          "printed_page": 386,
          "text_path": "financial-reference-recovery/pages/page-04037.txt",
          "text_sha256": "ae455d09b1a0e0cdc1879bb99dc19b3bac686156ae25b101daf34fd5562d53ea",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.confirmed_corruption_cases": {
        "value": 4,
        "unit": "cases under broad definition",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4071,
          "printed_page": 420,
          "text_path": "financial-reference-recovery/pages/page-04071.txt",
          "text_sha256": "43d79a5982e898804ec68cec1c6901e488794844e67d6b72af17a5bd7641d3d2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.corruption_convictions": {
        "value": 3,
        "unit": "convictions",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4071,
          "printed_page": 420,
          "text_path": "financial-reference-recovery/pages/page-04071.txt",
          "text_sha256": "43d79a5982e898804ec68cec1c6901e488794844e67d6b72af17a5bd7641d3d2",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.all_investigation_reports": {
        "value": 4214,
        "unit": "reports",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4070,
          "printed_page": 419,
          "text_path": "financial-reference-recovery/pages/page-04070.txt",
          "text_sha256": "1011c04cdb82cf354506ce03f6bff36fa504e302a660611eb4d00c04984d1529",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "kpi.political_contributions": {
        "value": 185,
        "unit": "EUR thousand",
        "period": "2025",
        "scope": "See linked source-specific population",
        "source": {
          "physical_page": 4075,
          "printed_page": 424,
          "text_path": "financial-reference-recovery/pages/page-04075.txt",
          "text_sha256": "3c99b2191b4769f2a9d7f6f57311c6e14abf1e05848daf58c620cb7841eaeca1",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "method_qualifier": "Keep source population and method"
      },
      "ag.headcount": {
        "value": 106123,
        "unit": "headcount",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ag.training_hours": {
        "value": 8.6,
        "unit": "hours/employee",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ag.trir": {
        "value": 12.7,
        "unit": "recordable accidents per million hours",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ag.ltifr": {
        "value": 8.1,
        "unit": "lost-day accidents per million hours",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ag.energy": {
        "value": 2.2,
        "unit": "million MWh",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ag.scope1": {
        "value": 0.9,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "ag.scope2_market": {
        "value": 0.1,
        "unit": "million tCO2e",
        "period": "2025",
        "scope": "Volkswagen AG legal entity only",
        "source": {
          "physical_page": 4104,
          "printed_page": 453,
          "text_path": "financial-reference-recovery/pages/page-04104.txt",
          "text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained"
      },
      "waste.total.2025": {
        "value": 2547290,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.recovery.2025": {
        "value": 2337130,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.prepare_reuse.2025": {
        "value": 140152,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.recycling.2025": {
        "value": 2089334,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.other_recovery.2025": {
        "value": 107645,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.disposal.2025": {
        "value": 210160,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.nonrecycled.2025": {
        "value": 317805,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.nonrecycled_share.2025": {
        "value": 12.5,
        "unit": "%",
        "period": "2025",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.total.2024": {
        "value": 2357654,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.recovery.2024": {
        "value": 2185092,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.prepare_reuse.2024": {
        "value": 171809,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.recycling.2024": {
        "value": 1875417,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.other_recovery.2024": {
        "value": 137866,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.disposal.2024": {
        "value": 172596,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.nonrecycled.2024": {
        "value": 310492,
        "unit": "tonnes",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "waste.nonrecycled_share.2024": {
        "value": 13.2,
        "unit": "%",
        "period": "2024",
        "scope": "Volkswagen Group environmental reporting perimeter",
        "source": {
          "physical_page": 3981,
          "printed_page": 330,
          "text_path": "financial-reference-recovery/pages/page-03981.txt",
          "text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "estimated": true,
        "nonrecycled_definition": "Excludes preparation for reuse; disposal plus other recovery"
      },
      "materials.total_bev": {
        "value": 1782194,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Main reference-vehicle model; Porsche/TRATON separate, Everllence not reported",
        "source": {
          "physical_page": 3976,
          "printed_page": 325,
          "text_path": "financial-reference-recovery/pages/page-03976.txt",
          "text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "production_offcuts_included": false,
        "measurement": "Reference-vehicle extrapolation, not direct census"
      },
      "materials.total_ice": {
        "value": 8403399,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Main reference-vehicle model; Porsche/TRATON separate, Everllence not reported",
        "source": {
          "physical_page": 3976,
          "printed_page": 325,
          "text_path": "financial-reference-recovery/pages/page-03976.txt",
          "text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "production_offcuts_included": false,
        "measurement": "Reference-vehicle extrapolation, not direct census"
      },
      "materials.bev_min": {
        "value": 225283,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Main reference-vehicle model; Porsche/TRATON separate, Everllence not reported",
        "source": {
          "physical_page": 3976,
          "printed_page": 325,
          "text_path": "financial-reference-recovery/pages/page-03976.txt",
          "text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "production_offcuts_included": false,
        "measurement": "Reference-vehicle extrapolation, not direct census"
      },
      "materials.bev_max": {
        "value": 455177,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Main reference-vehicle model; Porsche/TRATON separate, Everllence not reported",
        "source": {
          "physical_page": 3976,
          "printed_page": 325,
          "text_path": "financial-reference-recovery/pages/page-03976.txt",
          "text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "production_offcuts_included": false,
        "measurement": "Reference-vehicle extrapolation, not direct census"
      },
      "materials.ice_min": {
        "value": 1387806,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Main reference-vehicle model; Porsche/TRATON separate, Everllence not reported",
        "source": {
          "physical_page": 3976,
          "printed_page": 325,
          "text_path": "financial-reference-recovery/pages/page-03976.txt",
          "text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "production_offcuts_included": false,
        "measurement": "Reference-vehicle extrapolation, not direct census"
      },
      "materials.ice_max": {
        "value": 2202596,
        "unit": "tonnes",
        "period": "2025",
        "scope": "Main reference-vehicle model; Porsche/TRATON separate, Everllence not reported",
        "source": {
          "physical_page": 3976,
          "printed_page": 325,
          "text_path": "financial-reference-recovery/pages/page-03976.txt",
          "text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "limited sustainability assurance; specific exceptions and voluntary disclosures retained",
        "production_offcuts_included": false,
        "measurement": "Reference-vehicle extrapolation, not direct census"
      },
      "brand.core.vehicles.2025": {
        "value": 5125,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.core.vehicles.2024": {
        "value": 4960,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.core.revenue.2025": {
        "value": 145202,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.core.revenue.2024": {
        "value": 140004,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.core.operating.2025": {
        "value": 6821,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.core.operating.2024": {
        "value": 6961,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.progressive.vehicles.2025": {
        "value": 1145,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.progressive.vehicles.2024": {
        "value": 1123,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.progressive.revenue.2025": {
        "value": 65503,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.progressive.revenue.2024": {
        "value": 64532,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.progressive.operating.2025": {
        "value": 3371,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.progressive.operating.2024": {
        "value": 3903,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.sport_luxury.vehicles.2025": {
        "value": 266,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.sport_luxury.vehicles.2024": {
        "value": 313,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.sport_luxury.revenue.2025": {
        "value": 32185,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.sport_luxury.revenue.2024": {
        "value": 36438,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.sport_luxury.operating.2025": {
        "value": 90,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.sport_luxury.operating.2024": {
        "value": 5286,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.cariad.vehicles.2025": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": true
      },
      "brand.cariad.vehicles.2024": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": true
      },
      "brand.cariad.revenue.2025": {
        "value": 1775,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.cariad.revenue.2024": {
        "value": 1327,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.cariad.operating.2025": {
        "value": -2180,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.cariad.operating.2024": {
        "value": -2431,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.battery.vehicles.2025": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": true
      },
      "brand.battery.vehicles.2024": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": true
      },
      "brand.battery.revenue.2025": {
        "value": 30,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.battery.revenue.2024": {
        "value": 8,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.battery.operating.2025": {
        "value": -1386,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.battery.operating.2024": {
        "value": -1053,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.trucks.vehicles.2025": {
        "value": 306,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.trucks.vehicles.2024": {
        "value": 335,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.trucks.revenue.2025": {
        "value": 42540,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.trucks.revenue.2024": {
        "value": 46183,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.trucks.operating.2025": {
        "value": 2411,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.trucks.operating.2024": {
        "value": 4204,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.china_equity.vehicles.2025": {
        "value": 2588,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.china_equity.vehicles.2024": {
        "value": 2742,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.china_equity.revenue.2025": {
        "value": null,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": false
      },
      "brand.china_equity.revenue.2024": {
        "value": null,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": false
      },
      "brand.china_equity.operating.2025": {
        "value": null,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": false
      },
      "brand.china_equity.operating.2024": {
        "value": null,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": false
      },
      "brand.mobility.vehicles.2025": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": true
      },
      "brand.mobility.vehicles.2024": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "excluded/not applicable dash",
        "china_jv_included": true
      },
      "brand.mobility.revenue.2025": {
        "value": 57769,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.mobility.revenue.2024": {
        "value": 54806,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.mobility.operating.2025": {
        "value": 3451,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.mobility.operating.2024": {
        "value": 3000,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.other.vehicles.2025": {
        "value": -407,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.other.vehicles.2024": {
        "value": -435,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.other.revenue.2025": {
        "value": -23092,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.other.revenue.2024": {
        "value": -18643,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.other.operating.2025": {
        "value": -3710,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.other.operating.2024": {
        "value": -810,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.group.vehicles.2025": {
        "value": 9022,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.group.vehicles.2024": {
        "value": 9037,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": true
      },
      "brand.group.revenue.2025": {
        "value": 321913,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.group.revenue.2024": {
        "value": 324656,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.group.operating.2025": {
        "value": 8868,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "brand.group.operating.2024": {
        "value": 19060,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Brand groups and business fields; not IFRS reporting segments",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside this sustainability assurance module; refer core financial-audit scope",
        "status": "reported",
        "china_jv_included": false
      },
      "porsche_including_financial_services.revenue.2025": {
        "value": 36272,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Porsche including Financial Services; differs Sport Luxury automotive row",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module"
      },
      "porsche_including_financial_services.operating.2025": {
        "value": 413,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Porsche including Financial Services; differs Sport Luxury automotive row",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module"
      },
      "porsche_including_financial_services.revenue.2024": {
        "value": 40083,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Porsche including Financial Services; differs Sport Luxury automotive row",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module"
      },
      "porsche_including_financial_services.operating.2024": {
        "value": 5637,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Porsche including Financial Services; differs Sport Luxury automotive row",
        "source": {
          "physical_page": 4107,
          "printed_page": 456,
          "text_path": "financial-reference-recovery/pages/page-04107.txt",
          "text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module"
      },
      "core.vw.vehicles.2025": {
        "value": 3104,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw.vehicles.2024": {
        "value": 3109,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw.revenue.2025": {
        "value": 86570,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw.revenue.2024": {
        "value": 88262,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw.operating.2025": {
        "value": 2612,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw.operating.2024": {
        "value": 2587,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.skoda.vehicles.2025": {
        "value": 1173,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.skoda.vehicles.2024": {
        "value": 1090,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.skoda.revenue.2025": {
        "value": 30105,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.skoda.revenue.2024": {
        "value": 27787,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.skoda.operating.2025": {
        "value": 2502,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.skoda.operating.2024": {
        "value": 2305,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.seat_cupra.vehicles.2025": {
        "value": 657,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.seat_cupra.vehicles.2024": {
        "value": 637,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.seat_cupra.revenue.2025": {
        "value": 15272,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.seat_cupra.revenue.2024": {
        "value": 14530,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.seat_cupra.operating.2025": {
        "value": 1,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.seat_cupra.operating.2024": {
        "value": 633,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw_commercial.vehicles.2025": {
        "value": 428,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw_commercial.vehicles.2024": {
        "value": 404,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw_commercial.revenue.2025": {
        "value": 16857,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw_commercial.revenue.2024": {
        "value": 15124,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw_commercial.operating.2025": {
        "value": 245,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.vw_commercial.operating.2024": {
        "value": 743,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.components.vehicles.2025": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "not applicable dash"
      },
      "core.components.vehicles.2024": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "not applicable dash"
      },
      "core.components.revenue.2025": {
        "value": 22476,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.components.revenue.2024": {
        "value": 20645,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.components.operating.2025": {
        "value": 1503,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.components.operating.2024": {
        "value": 703,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.consolidation.vehicles.2025": {
        "value": -238,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.consolidation.vehicles.2024": {
        "value": -281,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.consolidation.revenue.2025": {
        "value": -26078,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.consolidation.revenue.2024": {
        "value": -26345,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.consolidation.operating.2025": {
        "value": -42,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "core.consolidation.operating.2024": {
        "value": -11,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Core brand group including consolidation",
        "source": {
          "physical_page": 4108,
          "printed_page": 457,
          "text_path": "financial-reference-recovery/pages/page-04108.txt",
          "text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "status": "reported"
      },
      "market.europe_other.vehicles.2025": {
        "value": 4406,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.europe_other.vehicles.2024": {
        "value": 4204,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.europe_other.revenue.2025": {
        "value": 204549,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.europe_other.revenue.2024": {
        "value": 194145,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.north_america.vehicles.2025": {
        "value": 947,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.north_america.vehicles.2024": {
        "value": 1080,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.north_america.revenue.2025": {
        "value": 60001,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.north_america.revenue.2024": {
        "value": 67712,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.south_america.vehicles.2025": {
        "value": 669,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.south_america.vehicles.2024": {
        "value": 606,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.south_america.revenue.2025": {
        "value": 18971,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.south_america.revenue.2024": {
        "value": 18962,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.asia_pacific.vehicles.2025": {
        "value": 3000,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.asia_pacific.vehicles.2024": {
        "value": 3147,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "reported"
      },
      "market.asia_pacific.revenue.2025": {
        "value": 38154,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.asia_pacific.revenue.2024": {
        "value": 44057,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.hedges.vehicles.2025": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "not applicable dash"
      },
      "market.hedges.vehicles.2024": {
        "value": null,
        "unit": "thousand vehicles",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": true,
        "status": "not applicable dash"
      },
      "market.hedges.revenue.2025": {
        "value": 238,
        "unit": "EUR million",
        "period": "2025",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      },
      "market.hedges.revenue.2024": {
        "value": -219,
        "unit": "EUR million",
        "period": "2024",
        "scope": "Group geographical markets",
        "source": {
          "physical_page": 4109,
          "printed_page": 458,
          "text_path": "financial-reference-recovery/pages/page-04109.txt",
          "text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
          "pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802"
        },
        "value_type": "reported_actual",
        "assurance": "Outside sustainability module",
        "china_jv_included": false,
        "status": "reported"
      }
    },
    "assurance_scope_evidence": [
      {
        "physical_page": 4308,
        "printed_page": 657,
        "meaning": "Limited sustainability engagement overall; reasonable only EU Taxonomy, DCI2024–25, BYR2020–24"
      },
      {
        "physical_page": 4312,
        "printed_page": 661,
        "meaning": "Certificates existence considered, not effectiveness; unavailable value-chain information not independently identified"
      }
    ]
  },
  "coreExceptions": [
    {
      "id": "EX001",
      "kind": "resolved_extraction",
      "physical_page": 4195,
      "detail": "2024 Level1 is42 plus footnote1, not421. Render verifies42+1753+665=2460."
    },
    {
      "id": "EX002",
      "kind": "unresolved_scope",
      "pages": [
        4169,
        4191
      ],
      "detail": "Finance lease receivables70169/67575 differ net investment70122/67478. No fabricated reconciling value."
    },
    {
      "id": "EX003",
      "kind": "unresolved_scope",
      "pages": [
        4155,
        4189
      ],
      "detail": "Lease interest280/266 in financial result versus289/275 lease disclosure; retain exact source values."
    },
    {
      "id": "EX004",
      "kind": "rounding",
      "detail": "Ordinary independently rounded sums can differ; equality to reported source remains exact regardless arithmetic tolerance."
    },
    {
      "id": "EX005",
      "kind": "unresolved_scope",
      "pages": [
        4212,
        4213,
        4215
      ],
      "detail": "Maximum credit risk2024 guarantees/commitments14834=gross14994-allowance160.2025 presented13244 equals gross, while allowance170 exists. Preserve comparison asymmetry, do not rewrite."
    },
    {
      "id": "EX006",
      "kind": "unresolved_scope",
      "pages": [
        4155,
        4184
      ],
      "detail": "2024 pension net interest971 in interest note versus967 pension note;2025 both936. Preserve."
    }
  ],
  "sustainabilityExceptions": [
    {
      "id": "CREDITS2024",
      "title": "Carbon-credit components exceed the reported total",
      "physical_pages": [
        3931
      ],
      "printed_pages": [
        280
      ],
      "classification": "source arithmetic",
      "detail": "2024 VERRA4,232,578 +Gold Standard1,844,460 =6,077,038tCO2e; reported total6,076,738. Difference300tonnes, confirmed visually. 2025 components383,784 +296,595 tie680,379.",
      "required_demo_treatment": "Preserve all source figures. Display the300-tonne unreconciled difference. Never insert a reconciling item or quietly replace the total.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "WATER2025",
      "title": "Group water-consumption bridge does not reconcile",
      "physical_pages": [
        3951,
        3953
      ],
      "printed_pages": [
        300,
        302
      ],
      "classification": "unresolved measurement bridge",
      "detail": "2025 Group withdrawal19.9 minus discharge12.1 =7.8millionm3, while consumption7.5 is reported. Difference0.3 exceeds rounding interval0.15. The report says consumption is generally the difference; it supplies no sufficient reconciling explanation. Withdrawal/discharge are voluntary and not externally validated.",
      "required_demo_treatment": "Mark unresolved source/method bridge. Do not imply independently established reporting misstatement or invent leakage/storage adjustments.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "WATER2024",
      "title": "Prior-year Group water bridge does not reconcile",
      "physical_pages": [
        3951,
        3953
      ],
      "printed_pages": [
        300,
        302
      ],
      "classification": "unresolved measurement bridge",
      "detail": "2024 Group withdrawal21.2 minus discharge13.9 =7.3millionm3, while corrected consumption7.7 is reported. Difference−0.4 exceeds rounding interval0.15.",
      "required_demo_treatment": "Keep the corrected reported figure7.7 and independently computed7.3 in separate fields. Do not replace either.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "WASTE2024TOTAL",
      "title": "Waste recovery and disposal exceed the reported total",
      "physical_pages": [
        3981
      ],
      "printed_pages": [
        330
      ],
      "classification": "source arithmetic",
      "detail": "2024 Group recovery2,185,092 +disposal172,596 =2,357,688tonnes versus reported total2,357,654; difference34tonnes. Whole-tonne display rounding cannot explain the difference. Several rows contain estimates.",
      "required_demo_treatment": "Report the34-tonne source discrepancy; do not normalize components into a fabricated balancing row.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "WASTE2024NONRECYCLED",
      "title": "Non-recycled waste does not match stated classification",
      "physical_pages": [
        3981
      ],
      "printed_pages": [
        330
      ],
      "classification": "source arithmetic",
      "detail": "2024 disposal172,596 +other recovery137,866 =310,462tonnes, but non-recycled waste is310,492. Difference30tonnes. Preparation for reuse is explicitly excluded from non-recycled waste.",
      "required_demo_treatment": "Retain reported310,492 and the classification-based calculation310,462. Do not equate non-recycled with100%minusrecycling, because preparation for reuse is excluded.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "WORKFORCE2024GENDER",
      "title": "Contract table conflicts with gender table",
      "physical_pages": [
        4008,
        4010
      ],
      "printed_pages": [
        357,
        359
      ],
      "classification": "source cross-table inconsistency",
      "detail": "2024 contract table Employees row prints not-disclosed0; the dedicated gender table and permanent-contract row print33. The contract-row gender sum is614,049 versus total614,082. Visual inspection confirms the0 is printed in the source.",
      "required_demo_treatment": "Keep both values and flag33persons. Never silently copy33 into the source table or describe0 as a missing-data marker.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "WORKFORCE2025REGION",
      "title": "Regional table conflicts with map and Group total",
      "physical_pages": [
        4010,
        4011
      ],
      "printed_pages": [
        359,
        360
      ],
      "classification": "source cross-table inconsistency",
      "detail": "The map prints Europe/other Markets203,499; the adjacent regional table prints203,449. Using the map yields602,659, equal to Group headcount. Using the table yields602,609,50 below Group. This direction was established by executable arithmetic.",
      "required_demo_treatment": "Retain separate map/table observations and highlight the50-person discrepancy. The map reconciles; the table does not.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "CREDITSLABEL",
      "title": "Carbon-credit table repeats an incompatible row label",
      "physical_pages": [
        3931
      ],
      "printed_pages": [
        280
      ],
      "classification": "source label ambiguity",
      "detail": "The source uses exactly “Share of projects to reduce CO2 emissions” for both a0%row and a100%row. The rows between concern biogenic and technological removals. The label duplication is present in the rendered PDF, not just extracted text.",
      "required_demo_treatment": "Keep raw labels and unique row IDs. Do not silently relabel the first row as removal projects or classify it using assumption.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "MANOVERLAP",
      "title": "MAN light-commercial Scope3 overlap is explicitly disclosed",
      "physical_pages": [
        3923,
        3924
      ],
      "printed_pages": [
        272,
        273
      ],
      "classification": "acknowledged source boundary overlap",
      "detail": "MAN light-commercial vehicles appear in both Passenger Cars and Commercial Vehicles reporting scopes. The report plans to eliminate the double-counting in the next report; it supplies no amount to remove here.",
      "required_demo_treatment": "Warn about the known overlap without subtracting a guessed amount. Do not label the three business-area totals an exhaustive partition of Group Scope3.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "GHGINTENSITY",
      "title": "Displayed GHG total cannot directly reproduce intensity",
      "physical_pages": [
        3930
      ],
      "printed_pages": [
        279
      ],
      "classification": "insufficient scope reconciliation",
      "detail": "2025 total market GHG887.4milliontCO2e divided by revenue321,913millionEUR gives about2.757kg/EUR, not reported2.3. The intensity excludes operationally controlled companies, while the displayed total has broader scope. A sufficient numerator bridge is not disclosed.",
      "required_demo_treatment": "Keep2.3 as reported and mark recomputation from displayed total not supported. Do not create an implied excluded-emissions figure from rounded intensity.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "INDEXS1TARGETS",
      "title": "Index swaps two target-section page references",
      "physical_pages": [
        4017,
        4020,
        4081
      ],
      "printed_pages": [
        366,
        369,
        430
      ],
      "classification": "source cross-reference inconsistency",
      "detail": "Printed430 index S1-5 assigns Other work-related rights to366 and Equal treatment/equal opportunities to369. Actual headings are the reverse: Equal treatment on366, Other work-related rights on369. Visual inspection confirms the index values.",
      "required_demo_treatment": "Store raw index and verified destination separately. Evidence links should resolve to actual sections without falsifying source index content.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "PALMELACOUNTRY",
      "title": "Palmela country printed incorrectly in biodiversity annex",
      "physical_pages": [
        4092
      ],
      "printed_pages": [
        441
      ],
      "classification": "source geographic inconsistency independently verified",
      "detail": "The source table prints Great Britain and Northern Ireland in the Palmela column. Independent annex reviewer confirmed visually and corroborated Portugal through official Volkswagen material. See sibling annex/source-exceptions files for evidence and detailed disposition.",
      "required_demo_treatment": "Preserve printed and corroborated geography separately. Do not use raw country for aggregation without an explicit exception policy.",
      "status": "open source exception; no invented correction"
    },
    {
      "id": "RAWMATERIALGROUPS",
      "title": "Count wording and listed strategic material groups differ",
      "physical_pages": [
        3974,
        3975
      ],
      "printed_pages": [
        323,
        324
      ],
      "classification": "source grouping ambiguity",
      "detail": "Text twice says nine strategic raw-material groups but enumerates ten comma-separated grouped entries when semiconductor materials and recycled materials are each treated as one group. The adjacent graphic distinguishes VW relevance from CRMA status rather than resolving the grouping.",
      "required_demo_treatment": "Do not infer a definitive count of managed groups from list parsing. Retain the source claim9 with the unresolved enumeration caveat.",
      "status": "open source exception; no invented correction"
    }
  ],
  "coverage": {
    "source_range": [
      3650,
      4322
    ],
    "expected_pages": 673,
    "semantic_ledger_pages": 673,
    "ledger_counts": {
      "core": 217,
      "management": 208,
      "sustainability_divisions": 238,
      "annex": 10
    },
    "missing_pages": [],
    "unexpected_pages": [],
    "duplicates": [],
    "invalid_records": [],
    "source_coverage_union_passed": true,
    "provenance": {
      "core": {
        "ledger_path": "semantic-ledger.json",
        "ledger_sha256": "7f62bcbbec045679e347adb4e27d74f092a7b4aac3e32c02be2de82448204a9b",
        "reviewed_pages": 217,
        "pages": [
          3650,
          3651,
          3652,
          3653,
          3654,
          4111,
          4112,
          4113,
          4114,
          4115,
          4116,
          4117,
          4118,
          4119,
          4120,
          4121,
          4122,
          4123,
          4124,
          4125,
          4126,
          4127,
          4128,
          4129,
          4130,
          4131,
          4132,
          4133,
          4134,
          4135,
          4136,
          4137,
          4138,
          4139,
          4140,
          4141,
          4142,
          4143,
          4144,
          4145,
          4146,
          4147,
          4148,
          4149,
          4150,
          4151,
          4152,
          4153,
          4154,
          4155,
          4156,
          4157,
          4158,
          4159,
          4160,
          4161,
          4162,
          4163,
          4164,
          4165,
          4166,
          4167,
          4168,
          4169,
          4170,
          4171,
          4172,
          4173,
          4174,
          4175,
          4176,
          4177,
          4178,
          4179,
          4180,
          4181,
          4182,
          4183,
          4184,
          4185,
          4186,
          4187,
          4188,
          4189,
          4190,
          4191,
          4192,
          4193,
          4194,
          4195,
          4196,
          4197,
          4198,
          4199,
          4200,
          4201,
          4202,
          4203,
          4204,
          4205,
          4206,
          4207,
          4208,
          4209,
          4210,
          4211,
          4212,
          4213,
          4214,
          4215,
          4216,
          4217,
          4218,
          4219,
          4220,
          4221,
          4222,
          4223,
          4224,
          4225,
          4226,
          4227,
          4228,
          4229,
          4230,
          4231,
          4232,
          4233,
          4234,
          4235,
          4236,
          4237,
          4238,
          4239,
          4240,
          4241,
          4242,
          4243,
          4244,
          4245,
          4246,
          4247,
          4248,
          4249,
          4250,
          4251,
          4252,
          4253,
          4254,
          4255,
          4256,
          4257,
          4258,
          4259,
          4260,
          4261,
          4262,
          4263,
          4264,
          4265,
          4266,
          4267,
          4268,
          4269,
          4270,
          4271,
          4272,
          4273,
          4274,
          4275,
          4276,
          4277,
          4278,
          4279,
          4280,
          4281,
          4282,
          4283,
          4284,
          4285,
          4286,
          4287,
          4288,
          4289,
          4290,
          4291,
          4292,
          4293,
          4294,
          4295,
          4296,
          4297,
          4298,
          4299,
          4300,
          4301,
          4302,
          4303,
          4304,
          4305,
          4306,
          4307,
          4308,
          4309,
          4310,
          4311,
          4312,
          4313,
          4314,
          4315,
          4316,
          4317,
          4318,
          4319,
          4320,
          4321,
          4322
        ]
      },
      "management": {
        "ledger_path": "management/semantic-ledger.json",
        "ledger_sha256": "074f5618bc7381323bff8593026d61bfcc01200229822cb5e219d79bf2326e32",
        "reviewed_pages": 208,
        "pages": [
          3655,
          3656,
          3657,
          3658,
          3659,
          3660,
          3661,
          3662,
          3663,
          3664,
          3665,
          3666,
          3667,
          3668,
          3669,
          3670,
          3671,
          3672,
          3673,
          3674,
          3675,
          3676,
          3677,
          3678,
          3679,
          3680,
          3681,
          3682,
          3683,
          3684,
          3685,
          3686,
          3687,
          3688,
          3689,
          3690,
          3691,
          3692,
          3693,
          3694,
          3695,
          3696,
          3697,
          3698,
          3699,
          3700,
          3701,
          3702,
          3703,
          3704,
          3705,
          3706,
          3707,
          3708,
          3709,
          3710,
          3711,
          3712,
          3713,
          3714,
          3715,
          3716,
          3717,
          3718,
          3719,
          3720,
          3721,
          3722,
          3723,
          3724,
          3725,
          3726,
          3727,
          3728,
          3729,
          3730,
          3731,
          3732,
          3733,
          3734,
          3735,
          3736,
          3737,
          3738,
          3739,
          3740,
          3741,
          3742,
          3743,
          3744,
          3745,
          3746,
          3747,
          3748,
          3749,
          3750,
          3751,
          3752,
          3753,
          3754,
          3755,
          3756,
          3757,
          3758,
          3759,
          3760,
          3761,
          3762,
          3763,
          3764,
          3765,
          3766,
          3767,
          3768,
          3769,
          3770,
          3771,
          3772,
          3773,
          3774,
          3775,
          3776,
          3777,
          3778,
          3779,
          3780,
          3781,
          3782,
          3783,
          3784,
          3785,
          3786,
          3787,
          3788,
          3789,
          3790,
          3791,
          3792,
          3793,
          3794,
          3795,
          3796,
          3797,
          3798,
          3799,
          3800,
          3801,
          3802,
          3803,
          3804,
          3805,
          3806,
          3807,
          3808,
          3809,
          3810,
          3811,
          3812,
          3813,
          3814,
          3815,
          3816,
          3817,
          3818,
          3819,
          3820,
          3821,
          3822,
          3823,
          3824,
          3825,
          3826,
          3827,
          3828,
          3829,
          3830,
          3831,
          3832,
          3833,
          3834,
          3835,
          3836,
          3837,
          3838,
          3839,
          3840,
          3841,
          3842,
          3843,
          3844,
          3845,
          3846,
          3847,
          3848,
          3849,
          3850,
          3851,
          3852,
          3853,
          3854,
          3855,
          3856,
          3857,
          3858,
          3859,
          3860,
          3861,
          3862
        ]
      },
      "sustainability_divisions": {
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "ledger_sha256": "6a66f9267374a59ebec8b80907013eeefab281fe2a1579c5671bfe63907e791d",
        "reviewed_pages": 238,
        "pages": [
          3863,
          3864,
          3865,
          3866,
          3867,
          3868,
          3869,
          3870,
          3871,
          3872,
          3873,
          3874,
          3875,
          3876,
          3877,
          3878,
          3879,
          3880,
          3881,
          3882,
          3883,
          3884,
          3885,
          3886,
          3887,
          3888,
          3889,
          3890,
          3891,
          3892,
          3893,
          3894,
          3895,
          3896,
          3897,
          3898,
          3899,
          3900,
          3901,
          3902,
          3903,
          3904,
          3905,
          3906,
          3907,
          3908,
          3909,
          3910,
          3911,
          3912,
          3913,
          3914,
          3915,
          3916,
          3917,
          3918,
          3919,
          3920,
          3921,
          3922,
          3923,
          3924,
          3925,
          3926,
          3927,
          3928,
          3929,
          3930,
          3931,
          3932,
          3933,
          3934,
          3935,
          3936,
          3937,
          3938,
          3939,
          3940,
          3941,
          3942,
          3943,
          3944,
          3945,
          3946,
          3947,
          3948,
          3949,
          3950,
          3951,
          3952,
          3953,
          3954,
          3955,
          3956,
          3957,
          3958,
          3959,
          3960,
          3961,
          3962,
          3963,
          3964,
          3965,
          3966,
          3967,
          3968,
          3969,
          3970,
          3971,
          3972,
          3973,
          3974,
          3975,
          3976,
          3977,
          3978,
          3979,
          3980,
          3981,
          3982,
          3983,
          3984,
          3985,
          3986,
          3987,
          3988,
          3989,
          3990,
          3991,
          3992,
          3993,
          3994,
          3995,
          3996,
          3997,
          3998,
          3999,
          4000,
          4001,
          4002,
          4003,
          4004,
          4005,
          4006,
          4007,
          4008,
          4009,
          4010,
          4011,
          4012,
          4013,
          4014,
          4015,
          4016,
          4017,
          4018,
          4019,
          4020,
          4021,
          4022,
          4023,
          4024,
          4025,
          4026,
          4027,
          4028,
          4029,
          4030,
          4031,
          4032,
          4033,
          4034,
          4035,
          4036,
          4037,
          4038,
          4039,
          4040,
          4041,
          4042,
          4043,
          4044,
          4045,
          4046,
          4047,
          4048,
          4049,
          4050,
          4051,
          4052,
          4053,
          4054,
          4055,
          4056,
          4057,
          4058,
          4059,
          4060,
          4061,
          4062,
          4063,
          4064,
          4065,
          4066,
          4067,
          4068,
          4069,
          4070,
          4071,
          4072,
          4073,
          4074,
          4075,
          4076,
          4077,
          4078,
          4079,
          4080,
          4081,
          4082,
          4083,
          4084,
          4085,
          4086,
          4087,
          4088,
          4089,
          4090,
          4091,
          4092,
          4093,
          4104,
          4105,
          4106,
          4107,
          4108,
          4109,
          4110
        ]
      },
      "annex": {
        "ledger_path": "annex/semantic-ledger.json",
        "ledger_sha256": "50e8cb1c2a919649734aacb4054cfa1d74956e31a6f09621b0c48136402ad9ce",
        "reviewed_pages": 10,
        "pages": [
          4094,
          4095,
          4096,
          4097,
          4098,
          4099,
          4100,
          4101,
          4102,
          4103
        ]
      }
    },
    "page_ownership": {
      "3650": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "545b56a2f364931d99d154661463d59be60b81feb806f8da4ba3e9734c2d88ee",
        "review_depth": "visual_boundary_inspection",
        "visual_verified": true
      },
      "3651": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "b67f67934d7c1ac0982a8b587e4f135bd0e8be396f6577c03f3299241c94b75f",
        "review_depth": "full_page_semantic_and_visual_chart_read",
        "visual_verified": true
      },
      "3652": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "15dc6326ebad24cd9e63bd86a096cf72df4b79b896d35ca916dfa40d95093fe9",
        "review_depth": "navigation_only",
        "visual_verified": true
      },
      "3653": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a52dbdb103baae8e33b090736de3abc4da6d66e903936ab1b3afab6cbe827270",
        "review_depth": "navigation_only",
        "visual_verified": true
      },
      "3654": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "455c218a3dc1dcdcc24a0d6bcc340a7d9339f137c2d518cecc8b71b408924d68",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4111": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d157c1b16bc599898086bd0704d006185b4919970677109199f61f8a2de94cbf",
        "review_depth": "navigation_only",
        "visual_verified": true
      },
      "4112": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f8068e819f6836051c80945b6bf29f37875c519439b020f04df5b608dca0a540",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4113": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6be03f8e19f3d5cd1df19cff0a0f2313770c979d5d2967c6b4eeb6d823f2498b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4114": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2ff118fc3436812dcb797b5b717ab95ccb1cb8db4b7d45777eca8747060bfc97",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4115": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "1a169b9adddb67326ad3b0ee0fc5283b893bd94882711217d1c38c6f9358d203",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4116": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c6c53849ae7c86dcc7f7ce93b7ebb606609673ecdb4112a3bf6c715fc68f8145",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4117": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "7b934e982b0c034dcd38bf10163baa1790d65705134af36c5dfba4b073e380fd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4118": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "b0b650697ceb2ca2c803bf7d0760159045de93a45476e763ffdcf1cf2a61bec8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4119": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "42ef79b99c4b2a786adc0bcc1bab963ccc9d8c1af4ab3bc1b77408c0137e2cf9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4120": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4dd3cbb4068e82598ea1412dc272c884437a17ab526a8aee9361057bf52a9def",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4121": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "5e8620516147f6a0b3ca90108baac48c6f4ee3ed3e2ffa5b4cc320745964445b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4122": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9cda54fae88e62f8805f610363eb18d30a5e4b4b36613cd373616a04b6aae050",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4123": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8a94431a2bf4155c84837879c8b648d007ab72a1e1fc3e414c8846c6ae04a708",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4124": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d458a71bcbcab58de0c730dd69f2bd5f042c40db0f1ca660f7d0b21c7bbe0afa",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4125": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "17a5728f5e95feb397e1140c762015a9adf2b48ac9da31f28ee2bddbbd5aee06",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4126": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "124cad535dcb5a2856c5510e4213409dcd44d8a20e7761176cc41e2d03d22ec9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4127": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "54ba95ffa148ce0a21aa9355860262f2e53fba1a6dedcefad949a835955aac06",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4128": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "fd762e2e34a895d7bb6ea1f7173f97df80ea96abc6ea831769d9544cb86a74aa",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4129": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0ec517d9b2475d4be8acefe31b185deee12d04139553518a14055848b302eb5e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4130": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ce7c3b8835f6236605efb036d24b81d2643213687cec12e910a71c99a5d34a63",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4131": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d6e18b8f1b108ce80121d5ddbde20998509c9496db27679e14c8265f3218897f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4132": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f733f0fba031b0d0f12b29b79a1fe4c74906ffd326d643b39ed19dba5d556895",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4133": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4dcf6c522640acf461f3a49aa61e5e0b7bb9b169bb123e9cdfdb782597ac64cd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4134": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0fb9761c290e027fcaccd69c2f9a75477d32fac4f3a4a42bb4de6c88e5e8c7e1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4135": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a48aae6b6bdbc88325f2a54835d2e63c336ed7597ca35415e3ddad482fc247f0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4136": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "68c7b9ec49ff4ac2763fc954c85f12807cc1debcd911d86482f1fd8072dcadfa",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4137": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "dd57eb604f20fd59b13b8ec107ea9f5848d55e4ff749b3e583870b68e6582d23",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4138": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0297ff3cb272fbaf75f6df92d31aadb77e246ad900ecb520f51751e639899b4c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4139": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "156739c8b3b92b1b336892fc664e889fccb7b94ec8f2e8c20719fee5f16307c4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4140": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "165b3894955e729905ef0dddec1e8fef25067d9133d1c76f569ac77be392b43e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4141": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "7146c048855ed89ac76cfb6d9083ab93beccb4862bde425aff5f53a58619d9a4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4142": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d69599434de3e8e3cebabebd805162b2909dd555b58981423a459e7207b19e7f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4143": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2cb19eae29dd2d4df28fb50e980b496150d32b4d8d060a0939d6193a923a1c74",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4144": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "cc7fdd6df3ef9c7e5cfc43fba95c02ff7b1a3dcc44222be94c05d60af1025ecf",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4145": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "af61df2a9ff6c2e2708f810e668498a1b70eade4cbac894965f4051f3b3b3c15",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4146": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f7e22bf2fb1b33a4c85a28e4ef6a72d4483ee09c30e6832ec82b35899c784aa1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4147": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "af350f6c6f3696655248d109a867a3669d31e2d578ed1057eeebe9eb659648e5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4148": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "995b44e7e5bd62386cf094c76b4476fad3106d76881367d15588f0c0402cbb3e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4149": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3774e04ef9b691f5bc95c2c825a4be19f61b3360004be1e07abefcfd72a95052",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4150": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0e3602a47a8d0c90868d40a0b3aa08e1c844a357abf5f85505a1ee44b68436ec",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4151": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0514ca1b26904900589176fdb41907d46f8665b51fb75e96bab95362e427b3c0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4152": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d2a90ab167c876fc6ea2adabd3477d1c780dbe57773944dcf2a0ee1bb443e9d7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4153": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4dd8beb6d1fa3f595fd31fbcb10ac08a4f332557360f0d2c744a05563a84c861",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4154": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "68947238927034f393c5f7d0a4bc80695d754e38e3a6b2a8247233673b77748c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4155": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "497a6f8bd6f99c03c668d38046ede597446da74c95354d6bf168696f8001bdfe",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4156": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a835fb837ff368faddd52881d8f7cb81fc19af4de522687089a51f2e35cef75e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4157": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c9645e8e5c4c97e60d6c61a7e2cda4a9ab1505c20778946875dfef49496a7367",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4158": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2c31648763d00d00860f0aee5c3c3afecf1ecd2dd6be81f54d24ebce1630baff",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4159": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "973edf20da526e8f63cf241e4b52a8334ebf986cada2c5a3a82e2ded3647bcda",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4160": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f60cbadadda12044d99434cea806d8b4d67165bf6b3968ad5a644141ced04c7b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4161": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "bb0deae6bd92013c679c97c5f352767a1a12f079c1ca16512af6a1091937acdd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4162": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6c1b6278f52b4ab53081f7272cfa6823cf9fef0d6c41c41b9d85937992585063",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4163": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "70b4fc520465c00457662e032ac2da138626c5a8741725d0c299d072a1cc9f01",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4164": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a2a618e9f195364221715877e7409c9c667029af1da6cef1210f1e4633429999",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4165": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3db654ad19e9bf05a0595af3126d4e7026066b8abaab36e80081ae841279825a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4166": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "00ffda1e98cbb1aa1cf96e823d30d4b16bf2ab8c57a4d787d043a8807eeebe82",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4167": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f9c661e3a94e99221b581454b0265b0866652cd53efb9e8eb1113794d0ef2526",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4168": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "b3afa14ee3aa3448833ecdc4960eae1aa1dddd9fd4a3ea33ad440b2f993db594",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4169": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9ad35ab8d7f362f35e28eafb80cd7391ab572d8950e56827949a6cbdd602544d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4170": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9c8e633ac61dc954f41ea84f586bea51828caaa296925eff627bf3086b358dea",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4171": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e24a77fe3c278e3b52f0cf6fffa212cdf6f96303de1b28389f0b6a508b8e1457",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4172": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d5101f1d6d5bcece55144764cfa9d4229b9b718a486c0c5a36d03f36582591e2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4173": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c22af46b147ce19d6fe2d360b2f2b3a5b8c232d6efafed0202a4a2f7f66301b9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4174": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0e21b7682f4bc47cbb55aca7b8d97e5c2c22a2825fc63e906da26e089757a3d4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4175": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0cf8f1c8f3cf6038673cfecc563b97944a412b16dcc21edaa2942c441895d90d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4176": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a4b682983b7d23577d65f81b2e51c8b4d656a67e1f2420e1c39d2a0943133bdf",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4177": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c841ce49de5f1f05b502279fdd5db517e057ac150852a3709027fab2c148eb7c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4178": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "7b0838509b2775be6c9f9052adea81106093ff18cce96fd528816667d2182675",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4179": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "92d9f36bd984977a8f35530e6a9273224dbf2659e5f2b6343dd1a42638bdf037",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4180": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "55fe8cec195a308a08f045d7d2572912449cb49beb54f77ab95ef13bc6b76ce1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4181": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9744c24b1294d9061f99169d79e8f52db370078536321b6dcda5eef4b7aed024",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4182": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2236a090a67aa64b0fd7da10576dd7e81973965e00e2e62b1e5c50f036dfe635",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4183": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f83bffb8b3f53c0efcf0ae961a938efea059b64563f67b5aa801a80c2075eb87",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4184": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "13df0bb84e75eafe5de99f4e63b5a7b94739cbd0e913bede45b3b449d7e9dde6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4185": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "fce80ea50ed03eaa3ca04583a9886c11015a8a2bfb3deaf4cfe4b51a22e83617",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4186": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2cbb6c6cad6abd6241e18e4a887392bf645198b66cc11e6507d96c500e1cb930",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4187": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0ca4bd1cce2b3d5a094dded6917f99a861745e2586658f7ab766ffc1a72138cb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4188": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "18028045e5636758f3eda09651bbe09fc72799006848fec2c4b5997549f1b98e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4189": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "39d62a5f41c3a351eb97ff784bfa5c01883a497d0dc91cbea12b237760cdb4c6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4190": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9a80e0d33f38a7357e255790fe7e4605ad4a6140f5ca0f9010e764f4cf941922",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4191": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6d9533fc2088feb2289fc92f1f6b890017f4cfc15fd108decd3a40d76c036d5b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4192": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a9f73b53e56585c2795513b56f7b11f308ce101d5636671f2df9f8a8459e32e6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4193": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e652083f314d9960ec49ac72997d3167b89d5d0ba2177bec415a6df96ab75141",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4194": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "efa2a9ffd249a1179699743294c99715584ac9349daaec60e13903b37e651028",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4195": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "87fe939e1f89362e6e27cb38e84f61b4177cf6c71c96292d98945596dc0bef73",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4196": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3747530263f827775239f3b98cab0f1acacd9ab3aeed3c648378b8d964f936cc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4197": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "7df01cd7ed6417be039a7b826cafaa60bdeaca774e82c2ab817b18575215e07e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4198": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "fbeb45bd8fba842640a0e2074c186d96a14c358b1f42bce98bafd0eb864d4a20",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4199": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2b1a071f8aa2aee302acddc5f37853e491ab4a4a0941b6f72866a79a5cdc6296",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4200": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ecfa38a8f4c3987cb3a27af92484814063c99766b173481eb75277910bd13be8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4201": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c3f9593e959e33d38f28638c9aa31d9c60010b398ffa6809b718ccf4eb8d3b04",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4202": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "65374f9b844983bed6af6cb0a7bda18a55634df61900ce331a4cf2aa7f47ebe6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4203": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e8d03707e57205e31a944802e35e00e15476fe427bed8759ecd0c3f2bdf31c39",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4204": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ea74fe9d1ffd81834ec6c5e7d7864b41bebc178d2737a38e55736e4aecfed22a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4205": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f80fe918dfd9721519c6a9d485e8d71e37a1b875efb8a6adf152a09ed271b36b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4206": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6399c8629f46f263922b94a472b740f8b7a822786788fea64d696de2a8a5eba1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4207": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "1cfe05d3fcb4aa7f7a3648f73f711f8894417cc7c098ebbf0f2505c6e043142d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4208": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a5be165d840be4b6f029083edc3878c31864b5aafaf05368724fa8bccf999603",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4209": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "150948762bd0998ff1a12464d873a85589f8fa01a0a52db1dacbb7114ad7255e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4210": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "cc7fb8394852d2e8af624b713a5439a4de2a64fa2d8d6dd520efb47af21d04fc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4211": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4f8746d857c586bba12d77817d8af8ca0dac3ab7b275e06676667f90b052b7b6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4212": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "70d5be862bc4bcefdf7d10c9e028b7f7cb22952d7d66f37bfd3d4f26ecdec06b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4213": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2155c34eb259f31096715fa57d5724388d03b7201b8a14892ad8732af5fea886",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4214": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "985520a571c249ef47825a2ff713108250be368e8a2624f6530c4cccb154286c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4215": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ee343f026b7ca6aa9c2a417d87bafb172b84b5ba704f192893f1fd6f51b07393",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4216": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4f8d6e75098d12c99ee10e44bcd213b26221c8875a16e438caeda503785274ca",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4217": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "888eb0fda93b120b458af26ef33e748fc056db74ac6557b0e486b04f1c36c6bb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4218": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "88aeb7613d82f93ea7f1a2e9099de34acdbe5a319bf31356e0e5ea557baf2afd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4219": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4047e80a686627d022798a4f30324fa369ec1efe9b2c1ffa3cc04b388f13c3d3",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4220": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3c449707d18b4ee036a634247afa43fbae56492d32367e8162503c8cc15d85cc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4221": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "05c12dcbfd651f54ecf8b5145089e5b4e1c44da33a66f6e24e28ef9fd9f762e8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4222": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e2beea96e7c80388aac3e431af582b8ca1dce8388b2f728ac6b0536a04941822",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4223": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "59c9ef8189c69b6f84d256b6fc5dc5cd4571c16b6faa386e17c78eaaaabec3f4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4224": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "346d46e1a009b45529725f4e0d437feaac8c924307b4ab5c90a13084636cf38c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4225": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "5bf29f35137fe67b2d7890b21bf0e94497db3fd65355d708305593794ccde28f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4226": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "eaa494c8021d1ae1f968cc9d9276750b977b9b06da25682b3ba536058150c0a8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4227": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9e15d17aaac3efaea29f44e0ed28059054dd076e7f33fc778814516f77d4d92c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4228": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0c17239b97fb0b43de5024c43ec25eb0b5921e079be25753cb0efe78dc7d3133",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4229": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "cd30191d1432937b77f7340e4743c5281127df5d8c4507d9ce0d5c558c716a5c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4230": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "50002cf34f6deec1f23fd67111fd1ffabfdb31e7481756ace5f463d75eb94bda",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4231": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e26ee8b45a18a841864be0947708f3cc120b3ec9b2e5d0f03b4a79d0d7eb54e2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4232": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "57ed0d8183bdef8e34d0e2154a2277afd782becce90246ca6de639ac8f866836",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4233": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "41376fd2dfe1cbd85c34f21830d56a4b2c6f1d159561804a04563456161c13cf",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4234": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "47466be63cee14acb7effa78183e27fdaf6e1aaad31a778017dc33f607b9010f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4235": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9c438afadf29e0fe948fb5d0c96483111e46fc47367ba09384aafefe681e7504",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4236": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "aa5af500434fe606b89a61604f7ad9164e4313bf5a27e73ecb731519e3854b19",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4237": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6dd5b5f33670767daca1a97aebfe7bb9705fd25fa6446e704c9b7c10b976b4da",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4238": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "acbf3b8d675085886da142aae499ea48ac86dc76e2562b67c0fcae2e8343aa25",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4239": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4c4aab7857d335fbe2cf961a7806554c0d72b6e40ac053f9860be10bc8d47561",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4240": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "36e8bddad965b9162078517cb90e1e61400c45730dba94206d515a175e3c8753",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4241": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "1a358257081fc48b6ade933855b07c830fbd5e563d56c927b1aceba6024ffeff",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4242": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c246c2071b46446ae660d8a4fefdc8af53e10f2b6761cc6ac5e4111d99f4d60b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4243": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "01cbaced498f1b4332a41ea3f6003c664aee316cb837be02ce474804ea96985c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4244": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "1bf950dfc44327f7e4a9d7c81c3c52a565f98bcf1516ce44c17b0c669b5166d4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4245": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "9310936bf35b673451ce8db4a2ec4cc7a07179af2b8735d821bf5d390ec76441",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4246": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e37a4ab0219c4b2765d980b3e5d5bd609f28753170d1a2d4bae9a0be1af0d515",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4247": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e3cde96150b816ac4cf54dbaa2ad64b8d91231b96565bce1f5bb6cd25c51fb6b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4248": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "318cb907ab332652c919394de5c7b6cddf5c32815cc93faeb2246b0fb3e8ea64",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4249": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d41f6e1844e137aa27ecbf9c486013354d6971c0e78fc65984e51a9793dc79d6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4250": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a85bd535ee6f41db41db80f13d3847ff28c58ccf8e0fb5a8f08bfaf56b54c97b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4251": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "1194f75ae4ee7a1948f4a089e11aea551063702ae49912f009bca65cd0cb586b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4252": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "21ad77c3aeefade3f071bf4b77321a1939fa1a8f944d5ba8973789963b5ee1fb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4253": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8aff6115af88eb349569f44eb47b03e89aa362d9d7446b923a0a055112ef7c10",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4254": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a19215b591f9f0e646f654a6c6c7bb8337558fee960779648c20b7ad6053957b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4255": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "79ae14572730a043d486df4f68c6d734cb8c2fb11968934e41a336665b577542",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4256": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "dbcc91ce5b51b9529e7e7dfbf686dc3dc87d8cdd94b34b332e94c5825362b7c5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4257": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a2a02b85e47efbcb103bada7cf9236c5d407fe4b475c6f5244cdc158d0f2df55",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4258": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "eea44bfb320af4ef3dd5fc7b7002273b958e79595cc8fd4be7fa8ccac1050ef9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4259": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "31de0c58e5ba448e4f95960325b8d73e3fb6e3ec65a1f4892b94546e95f0d9c2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4260": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "bc8914d186320720222277711d0426d0b696a14ead50c7d01d6685f3a34fa2c7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4261": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2edf3635729181464917e48ded1960094758c890473947f1527889352a9cc592",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4262": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "b82ec8eb6f0a3ff5eb69c14db184fb300a2edcb700cebdaf8c042ec07dd06b62",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4263": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "34ed245f0d32f0edd5fa10803772ac5b63a851a876bac7d175e489147c8db51f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4264": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ceba2940f2ce3961687091a1c5e711cebb38f347f3f8106fc69036ae15450043",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4265": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "843ad3d8c46b688027e145e851f7808d1907e9f03a081dba05c31ad91d5ff175",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4266": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "87a54daec1aa9132aaf3e5a3d76f3d96f6c521bcca9f713984947fa2c167bc5a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4267": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8a4918612b8b518959d4b26b6d9afc0284c9d585ed2f9ddffacf78bbd6ac9154",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4268": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "665eaec73cdc629e859b312117c60ba165f63aa53aebd7e2d3f83ec5fc42cbb1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4269": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a8eee3b0b14877c6b8e49d2be0f4cb28854f8bb878fd81b9ef9c86a80fb52b01",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4270": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4da2e6436bd96aa8628ab48e83b9dd1a1bc3135f74d970367a246ffb7ab1c2c3",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4271": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "fa11b5c6a0e7ae5efc599c9fff3577ad99e7670e8fd8692b57330106d0fa4c2b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4272": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f3dbd58c522d695c3673217e783bdcda79ab2526f76e284a77fe803482d5581b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4273": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8b4859b36295e6d60b6c7b612c52918f66902050e0fb3e71bbf7106fc9f34b35",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4274": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3dc7af3e8666853ffb623e22f0f93c1c69101707c4739d8baf6ea8e66c9f8e07",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4275": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "23b485b6b069671e4cbc45ec8053c2a5c8eb9289b48f7981e03ecf8d7dc2bbe4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4276": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "78661024f1a703d8b6d17db0522e5e759ac08790d2d177ecc641c90172ec95de",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4277": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "cc0424c9dc3939424e609b32b0e6256df0940f7cf4a1c4f480c0133ff0b372fb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4278": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "83184effc50e1c60c49911b5a2de05c1137fd5da06786ecf3da66e7cefa8156f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4279": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ffea91beb4c7d165d9bab9fdb2cf0fed4ca12e8b91b48d7a344c531379e3da9e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4280": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "ecefce659df7ae01c2a62b001ba671e395f510eedf8945271705d75ac6411442",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4281": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c8310184e1b12653b67a78d342df0e737b38f94f23cd550574b53b5bc14895c1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4282": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "0966581a8947bb7967aca3412dffe264ffa5f71645af62642b0faba00da22954",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4283": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "35afee626d335fba83c6a468bdb3b4f5a184d7056cfb9029f71a0d803c6efb92",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4284": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8d2448c35fa4cd82314da0334c4fd23e4709035064fcc54d6f417a125ccb0e9c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4285": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "5442552eeb2fc83f0f52efee62752d3300d7c3d569ce5be3529322edaff56a7e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4286": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "fb0d8eeb9ef47e93c0c48f2af547fce79379de434886641cbdc94902b8d93081",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4287": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4a856af91e4c03824ed138321217ffb4f0464e4abb208be0a72bf27cfc333db0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4288": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "dedab87c7ed438d0aab1bf7b58211bdc2cfadd30c4bf470eb607c889de5ebb55",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4289": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8b141e27a6b7a85ed7f723e5723482f30b8b59b7577c77d513d1437f75a5a7d3",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4290": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "977bc508faad56584ec56ee14dbe7a6665c7ad1b84121bcba2a77fdbaa368cca",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4291": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "f6573f9a68ade27917b236a073331908fa5dc4111394963ee69971ddc6dd4e0c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4292": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "5a772338c734f9e8a58a1e5a9f8719e74f7c056b14d0b45c807d0a17bf472964",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4293": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "35fc8d08fa6a979d92314d268c9c7e434df4fe61cf790410d776ee05f82a9f68",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4294": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "38083e83c420b627364053ce7573153cee245d7f551349705c8c462a4c499a9b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4295": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3e08fd3771fac4ad9daf90cc0ec7abb56921d7f9d26dd7a8ce1b158146b01c86",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4296": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "226aada7d80ff94c1a9753a2e22640a5f5e35ead81c5441c069c60a57f2a3cf9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4297": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "5ddbea87b2999e3f3a96c39fffd2221e507496a9f3e273d56b17240cab1bfc4d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4298": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d26d959d749da598390894486bbcf87121552e6d5ae42dc063e5430059c62dd3",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4299": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e72bcfc41ff08b5f1d0c07d371d25ace7495133aed9a23ff2781bbf20985d40c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4300": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "bdb5bfb266ed1cfa73ff700a15095fc0eb065e034273e03520ad13c220f2acfc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4301": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "5a53773852aafdf0ba8fc6a4f350f36095b333f0d70fb57d36a545eba90ba9a1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4302": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "bd488b9c4c112bb4fb28737117a9ed070247ae47a8549eb104b03750b4aee2ba",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4303": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "2dd98abff932e96baaf30fb767fa80940baaa38d3037c246313e2c800280e10a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4304": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "d8236d51abfeae7ecc34a08b956548c11280aa07e0e2217532bac800ded18eb8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4305": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a9c55c2e95509b926c5c321ed20486d9f4dc1a8261a2f3d26cb66dbacfe89213",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4306": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "cb221f8eb40466a27de5bf8b01a825dfc56b132b5242ccafd3f2a0f2a69618f4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4307": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "c00b296a8d7d88faf04399a8985068b9abbb22d0194ce03c12b633bc56746325",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4308": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "86f0e221ba8896bc42bfa8ec8ff0cb9868dc15e4b292a88743cab05944fa3c89",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4309": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "a9ab47c8fe414e03070146262312dd047774f9ccec3d98136a7b2ce759eaf8d6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4310": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "3caacf9161a4a32268ccae84d15706700ae19a17025154b125531c7e03d9ce7e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4311": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6f35457f2462076500b79732658c83eceee0a0389e4dc502d4dbb94c8704acde",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4312": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "6cfce0952d10e20e32599c7d4d65433fbaa4300bc3a4d94f8bfc7a07f8fc7591",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4313": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e48de541a5cca96e7a294e1e4630571bd8b894033c1f6e46a2e178d08f7cb219",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4314": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "1ed837b8970a11d35f9fe935860988adf3bc90b72ee714dbdc29c2d7459ca355",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4315": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "e92db57a05215d84beec8f6f7bef59640835fbaedf7e9ccc983996137e3dcc82",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4316": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "4b931e56d4081feb8808246f4a5df5809711d69c031c0e43c4262cc59ec700e1",
        "review_depth": "navigation_only",
        "visual_verified": false
      },
      "4317": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "692299a98e0f26c9cf3c954bab25cea13b79013996c24edf45a5326af8785e93",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4318": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "8731ee21b5ff2614a1e8cba5662e657490204edf15ac48ec5e5f4e1e6031cf94",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "4319": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "aa0bfdbc607e869786eb0fbb73028323122c0862d8e49c983cbb460707ee995e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4320": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "02d20c7658bbf884d0d132a78a9a83c5d46355989c2edcbb9dbfcc7d7eafa914",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4321": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "089725edb8e57876a8b5fcd5e3dde3a2cf402f31a2ecb299f146ca80039f37ea",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "4322": {
        "owner": "core",
        "ledger_path": "semantic-ledger.json",
        "source_text_sha256": "528effbbcb238dc811e6fd6d63da125003141eb8473eaf285f94f8dff636f55e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3655": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "78c5ee34b30dc8ac1747086d1fcd9f7769d56580157b3b649444d9d7e9b772fc",
        "review_depth": "navigation_only",
        "visual_verified": false
      },
      "3656": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "023544f66742df0361226a22b687eef5c03c2eb23288edbc65e34d16630958c0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3657": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d44b355774f069683dea6c39faa5b7aff35d48b1cbca376dabb9d9bba591c9b2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3658": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "9ecc3e21d96ae02585c3b035dced8079d55dd6b044fec859a95ca464d685031a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3659": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "bb2e4b854b0f1a78aa5feb04fac62cf8048dbcb0e48ed06134c75a051b1885c1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3660": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b272f11bf081a236d92ea7f32258e72173a3ad8f12f073d95301679d0f4cb3d5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3661": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e789f3e6f08e0ec41e6ae6d38749eed3fcf46b96f5b2e5dfb32d06198e2d7ecc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3662": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "5809a77b22454864f6d7d8b9a25efd6df9555c4617fd0029ef5548109491f8b5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3663": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "bf8b876bf184b4d10f81cc205ecf33abc542b257f15da1a5b7ae81a1bf91a512",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3664": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "70fa7438cae98db36cef0150e5b4b2681915e5e66eb62606235341f77bc6193e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3665": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "62875a18a5a57bc96bed7a1c2d608121e0bc73091483436ee1551a2cffec3ae4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3666": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "936027919c9368f4c3d60b0209320e985027319affcf5b7d61358b5d6cf009a9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3667": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "276f1789f691e6b4efde5ebb1a6fceddbea3c7b3b69fe60c9bf5b12e8f2d15ad",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3668": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "0b19cdc176edc563642b77f66ffd997d72f60b63a19b37b33580a8873a82a70a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3669": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "2d52715e3e5ee3226bc6ecadb5f2ea1d6ef3f99b854435bca15c030a1e529679",
        "review_depth": "navigation_only",
        "visual_verified": false
      },
      "3670": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "78660e980111ae6e666f593597b0f6f922933983ed83fe14b3175dcf2a9150ce",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3671": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e2b4ec4f6bc4f97927fe64c4b42217817a1028ca1cacaa5c7fbb1198d3ffb975",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3672": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d8d481409c795ce418f42765019bb783f75b7604dc6162499e484ec1701f6f35",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3673": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "72152121ef7fed62190b45e5f7fd530088cb44b3c145bd9551351df169cdabf5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3674": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "ae974dec0676a483eae78309091b88eece2ef489d9e9d4665afacdd063d3ab93",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3675": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "9bab337ed88eed28ff5a6b11ae333d87937df44386fbe6307e265b385e9f6687",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3676": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e796fb7cdf5a6124906a1c5ddebee224fd94ebe9aa1ba8f4f90264f92143d0b9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3677": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "10b49ae45f0dd068f6223d58bbe3b09776b27141018a29928f63b7a391877c49",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3678": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c814debdaba2bc2b8a143aa56eca24939f93eb6ec3b2e286170059dbb6908db7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3679": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "4b37f1d56fd0b7a1c68968f8589e9860691cd8744010b72de0d866f8540ff3f4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3680": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c00da00e73a957b80ff66fa4046f40777dca0bcfe80509a5cda5527de225453f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3681": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "072150f7fcac200fbac1d0f61537de47d6d116ace2a581d5f087ab6b5c0e81c8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3682": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "22bb045f8afd69f383b24be670c4ec671fb3eaf8c6fbf3f530201c17eade1664",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3683": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "24bf0713cca32a134f5acc4ef4c4996d7d7073fac43220ed143063d71e787efc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3684": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "5ee9952a4bbba8088b85a51ba13bc861c880974855f884ee40c1e8b51fba2e48",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3685": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "9ce6fc55762dcaf1bffc64b195aaae341c5eab1c336fe39162f637250fb85905",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3686": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "06c675db3577cb850cecdd3b51bdc6f7656a43b495c1a6a29bbe7847d791c12f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3687": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "19f734200c3184fe7f0469e2c6e724735ce2bff9b1256983af748e4e0a3feed8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3688": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e0d6513b4d92de6fd1d97fee068aa179e12723949e7f093d5f8277af7e212e34",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3689": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "1f0fdf69634e8bca4f9fd8aee250bace4e91b865cf0f2088cce6c864138cf860",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3690": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d8e126890e49b7f072dd212c4286ec6d1785eeeac10989ecfb5c32862e69dbf8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3691": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "8a3e2671bd836a935b429c0923f84abd30aefaf7bf2cb4cd0496b881e4cd4a61",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3692": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "527f25e31e586f5d2676e1f588fd147669cf38f68f0753fdf28457e3e84843c7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3693": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d680e6ed8804124c1294208d140b48f73619d86edb5c1843fcbc24229ec36604",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3694": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "76bb87655b229efed2d749c1f4fad2ab77cf5389f7f674e939656577a560bd15",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3695": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "9832c28b996029a3f6080f4311c5a39a39ee383afa8e0829365a9c4e37e1eca8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3696": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c4360b1f90742b12e1926e540c21378b63e34953154fadbab3d7996157d7dfd4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3697": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "006cb7611393e9793af5f13d9e933b6d78e710fd81bfc59ea856590c5c3ebd27",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3698": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f1bbcc1521a515e79ab593cf522752e14ee5524f182f81f169cdbe216afba8f7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3699": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "fc46e7addb8c6e54910fb67b2ccef8a63c64438e0e0ef5402e17ce8af28c5d32",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3700": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "aee70c224dea5806f064c3b95645ae88d2e516d4d2d5873f443778e8d8187047",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3701": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c4e238fc0f7dde17efea46919cfd9b744b35d36b3faf3c00933f8738659425f8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3702": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "294dc078e76f4b65664eedaaf6cb76f8a2a85999aed7b601b269c3ad32df0275",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3703": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b21ff74dd283e1fd1e57f0281f8c837445f8c09e46aaa9d15c7cb9fa595ea862",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3704": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "780db6b6c79177f181176705c526ce9739c20e4293d1bcda9616d0f35da7eb23",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3705": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b44df560c224719375610e83135cee2e9f84d2967a93dd21214da59419fa3aad",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3706": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a1ecefe3c70ac8e5df0e55324673e63dd8f32d1364745f1bc0963d021317c5dd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3707": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a6cfb7de718d63b1269a94610061e914cdbec71e5baaab2a1e148d264e4eec76",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3708": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e504b1d55dcc3cd4aa11b1c123b60d3e8c5d982b9c19522a4b6c4b89675a510e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3709": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "8ee9e92987e7c0e277bef325bf28ad2d2c661e6d67766794cd3d440ab962b893",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3710": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "cf9b982026c80a1a53f352aa5d74bb152691da55b82aa0f5c2b0c341ae7b4785",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3711": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f1280eeb460fefb60b738ea873c875cf1f4456757bdd470b527a8b9f0f52c143",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3712": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d7cf0f953e641c390c91ff964a30beb004c60196a6abdfa0a13d16ebea341640",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3713": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "5ed08da52a50dfd11bf8b8bea6d10d1004d99aa83adae33c768f94e03659ef2e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3714": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "7738faf7195822048ab4fb9f69a2c0c6ce1878c6683f97848c0316694fe8ca0a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3715": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b3ff26710dab5e777eae2caaf48b1e15d6d4d8c921ba29b51b325e543a4ea4fb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3716": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "aac63f74bc424db62037e7a2ea541e742baa82d23875e21a67fc8e8b90900c75",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3717": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f030d40e29cce03f082725371951dbe56fc6c62ac13898281f4d2fddb31a870f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3718": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "0259d8f4b6b95ae61d7d8882a8e4d2fa6e96876693327098ca94651a1f7e182e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3719": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c085e8957da031c559074d46de5ca61b1164c0f049ac0ab921b70a7f83441d01",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3720": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "49973ae1703b468bf2f952470a385c645204a3a974b3910d0ae335dbc52d7efd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3721": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "aee2594bf155cc017a0f03a35eeef1c8b6173e29e79da526d02c47acc6f5a487",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3722": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "598541581a2f63cf18a68d4af1392e3db215f368f76e711905cf5fc22184e1ff",
        "review_depth": "navigation_only",
        "visual_verified": false
      },
      "3723": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c0ffb72dcb2b69ce15acaa1ec3f9f746d57771bc537ae99c139d933d2ab510f9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3724": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "4a321aa3669352efbb5e5612848804f2bb49059d97562c23c8e7703fb4795df6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3725": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d9d8ffbdaa59b4b766f560d78be07fe5ff6bf99a1f09dfff8d431d92d752bbc2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3726": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a900b619e4278da4e644156b1ad48de9316bfb43209293fd1f2a95b7b2faae93",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3727": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b3b059303d8209d746692e2c95fa3a7d2e5d74e643636033313b4df2a71cd537",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3728": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "6b5853db460d72c1355da9a8df6dd6424283ef2a18518544ddec66f428305345",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3729": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "412d010a6de490b26e6590ba971f4969a6a50aeee7c8f25ad84666684d33fc11",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3730": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "6eed3cdcd72e4b0f2f7bb0f42b2208baac6d45a5527b5a8edeb6e11c8c3aa804",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3731": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b0e0d137ccc7c7c9421452fe853571c4045d9f52466533219ad6e8facde2dbad",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3732": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "703ac328d0b0f23944b6fb8b023c185444467e40fdee6231dd22d1e9871f87ed",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3733": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c038b334d669944d8796851dfe43aa3ed3ed66b02bf840b8806b90231ed3e9dd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3734": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "ba39a2201b290399049b0e17d7ff428c7cd3b113a01d203eb7722162a9d05f37",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3735": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "49278ae57478784eb2b81ff19726be7c9f1d82e93acbdb739305543d4544adb9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3736": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "49f8a7044cdb856c0669182549a818372160ed399db8bf166788130d27c6de33",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3737": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "14daf9ea16132e4766ab66ba61acbb8a702e3152c7a239d5ea219589003ff938",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3738": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "40e17f200e80ba889e00f55ca4c0b3bf03f9d59276b7d43fce8be542986fa4ab",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3739": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "79368d55980112c0321cb8ab74c9731183203ba99e218f93f5b9baabab3a6feb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3740": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a8d3ced9c9f13b8afdfeb65412b60cb5a53adf666e08a00f22d4f4885b2d160d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3741": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f88117b346caf4586748d9b192e3899d9ba8c53eff13f189ddcb5711ad29f676",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3742": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "365913e7403802a9a9eb56f92f1418353dbcb0a86edf0c4e842600762dfcdc20",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3743": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a68926da3453057782552b7cc3c5831561aab3e551e4a0ae5dda338fb47ea6ba",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3744": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "6944785e145fc85e32c1dcc220784ab6481f951b1d3bfe4fd2b4a7b6a2ab9174",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3745": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "cac0333cce68013a2e55703eebeba586b94efa5672b27229ad1d33d79c5459d9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3746": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "abc92d54c01f6cedc2c4545b1530a1867d0d5f49d036ed20779d36510eba6a9a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3747": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "6bb49df02293f1aee9550a453450f8e322a370a77369e746cb92f9f3829cad5d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3748": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e7adcd792f2e6840546b3750da2658238f12eafd709db866731be49e740c3bca",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3749": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b96be79f2cae572e35aa02ce62faf459328bc3749a2d6fbedc4dd5384e68c3e1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3750": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "75391adaa6d55504983ce766e5d68f43bc958be7a9b128c04975472a4624cd6e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3751": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "2ffccc4f15ee58d06d9cd6a37c6cf265792f3a6eba7a65d1568ffd96d3444aa8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3752": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "0160f546b886f6bfe148736bf7e4e8e05dcd61e232bb9bf4c96608c06e5a8ecb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3753": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "64ffb9e1593784483c7d97e7743abc3558c93579b9fb45cc7a3bdf57597bd5a8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3754": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "24abe7c18992578f4787d62fc6248e3d54e88299c5e368aa579585ca2396e216",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3755": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "bce4219489227186ef2e99baf5998274858bde376ef77dcb04a0cfe51927c3c4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3756": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "33ddc2fae51df4e046427a0dc34071b9e7f6d47473129afe236a9a389cd94a40",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3757": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "86ee9a5314c1b99cf0103096453f72336c945e67566c7d341a606338008098f0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3758": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "3588c196007935daaf69338a67dc189173582f310670cd839760d20bc1a086e8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3759": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "0c63e21340eb58949524e27c7bf6a3cde71674d9d730ac8db3d2395545b158e0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3760": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "36a6a0f333cdf5670e5a7d71c610a1d706856bbe2c3e74106e1fccbf5025bfda",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3761": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e9f6e6f408c7bc63076ecfe86b29a7f0c6137d34e8eecd4ec238aa6615b2365a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3762": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "9534b46e3343c91e15543441c010c4c64f9670b9e8f297558ee94dc9b7ba4d16",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3763": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a50a9d73a50aed1ec5da7e0e0ae78acee6061aa821dbb9e5391bc5babde663ca",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3764": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "50d2485d2b5b7cb5c69b72dab7aa5032421f824ec123c39c0d8afc9c3a06fe8b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3765": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a83f687b13683beb669c712292ca0ce72888a607e18333d1b6cfff8c64a9c979",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3766": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a68d22549feb33c21e304c4601cc520b5992afd9e8fbb1e389b4c3668b9e9c99",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3767": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "2fe7dcfcb5846297d010fdda7557eb988920d3d54f4cecd74c0c8e5efab679b6",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3768": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "47b420de617fae93623117196c6135e8c441b5898162c90c04ba7b926fa73597",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3769": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "59d8a90f16cec6f5e6f2e6855385dab105531c73dbd8f6150d35543344c1834b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3770": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c279c5fcf826da56664f03f70487cf0361e8579c49cdc05fef0eac3abedd76d2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3771": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "364761a46bd04770bd237eba3fa1a101f0b72dc329fb11095788f7363c14f316",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3772": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "1e969443e480a756a4c2d7a92c8eced70c4535b08b712d64e08e4a6d55d83a4b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3773": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "03e6d7cdd33687b3906296f3e359782cbc9f0d46ace35ae075e5bada80759de2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3774": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d088f7deccb0009b413917f58c337437183ede8d6c7be92abbd348fec990053d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3775": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b8d535f9bbbab56aa7bf7222407bde18a206223edab367d09c24a64d091c9461",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3776": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "fd42dc99f0c964ee00e5416f703e4188df2b189894ee73ab2c215ee5d4d79cfa",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3777": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "7375747cd722fc08e814255c55cdae038ced52ab32286cf6e648503e8a1f3f63",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3778": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "1e00e977103827ebe3e6e7b55149f11d3a67cf2436bd1b2fc7cb4b582bd97ff8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3779": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "9224d3423541ce67a4b564d9f6e505b9ca5d950a118677ea2b95715852cc2098",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3780": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "07fefcddb9c3ec214398f9414ad33cd2b63b96f6baabe4e64b5f3c3de4eab586",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3781": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c558c614e5b02a0395139a6867c4b5a08695694c774298412dfee95e57ff0cff",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3782": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "299f24fb1bc98736c7b98e7fb529887e5008f22c9405e7a9e25a8282ac8dd9e0",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3783": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "df0f3bacd155727a5f9bac62b5295297b38f336af0b4b44a4abae13f091f68a3",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3784": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "527045110d1b384eb983eecbd66b24f2eb0d29c406b195a90111a141e6a7558b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3785": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "219b5c664d0a34e7210f361e5e6b375b519888340f2eab686b4c82d3b104f92b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3786": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "88e8f0e4951b6f612b654bb3b22da5c3fdcc03095f9ad1bf26127b142c586003",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3787": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "66d793b98f8d2e625aa9bb4485c239301b00e67e81e3fe0fbf5f55effb5088b8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3788": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b92172b34317ec3f7427a605b7a3031f5399cce6ce8b671acf5e6bb3243a43b1",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3789": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "26d5d18b4f61a970eb3a4759a137b16e64407dade7ecb34249ab6e235560634c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3790": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f9ca2584d429a440a2ae5ff68a2b685a1bfe92e1f1293ea7f388255aad0c90e4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3791": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "85618c1f8cc4c366660293b7dc236679e5a380dc8373796e93aa1ad890a48101",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3792": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "11efb24a4e1db345ebb38e88d785dc54c82ab6886473572bdc8fcd88663e36da",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3793": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "1b10164e79708c6f4552007d558288e4425cef086b262c181c695261cb3c6e60",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3794": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "0aa039796690af4ede1fdc08dceabae1fcf8dfa102d4e9899a8836679beb93ed",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3795": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "de8e1cf87296b74dcb96b346cf18a921c9104dd9d2d654d194b0fbe5b4c204dd",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3796": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "222f100fc3a541729914c9be35631d41b944537b5cee3455214a962e498ddea8",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3797": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "4c29fc6ddcc4e951ec6e202692e7558e1962449336d8612448a6a9ec1c487e1d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3798": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "731e093e9805a12d8b064f4bf085d414703a2d69194a1f38669bea0854610a25",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3799": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "be48d59643b19e187e32fd9b800847975cf6a9e44e37246009da904a26aa1c2d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3800": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "7a1fd738809ca82eed2808197e54d09d88a268c0a17a5d6738e2a1fece29da0f",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3801": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "df56d235f3f99fe8150d222faddd1bc933389e0cdbe6cf9d9b9b38b3e481b6ee",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3802": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "ddb738471e002cf724ad1dba35a1a2cd42e50dab45597a88cad6a084b8ee15ef",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3803": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "491f951c61813378169031203dce5eb24699febbe402e28ab7faf0f574ca43ea",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3804": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "7daecddf570451b04adf2d06c24a3c089e30b2dfd0fd9704295178ed34aa7d69",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3805": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "51409a98bf25e0a763b214cb817650ed48543591bff5ef50d9db79822e38a369",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3806": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "fe394a3989496fc2066049ec6cd1312a971f083ec0bc7355427a7f623e7ad463",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3807": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d73e21cae752156cea042cb5a083fbbcc711b0d676dbfd2bccd79a060b9857be",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3808": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b0dea5cb9221d8d498698f4f87285f7279323d6e322e5e966dbccbd0660af22e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3809": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "c474c0747158f7787db8ddf02147ee82b5d46e4817f993ab8f938fa2af3e9170",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3810": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "7a86de2440a8920c977fb641ad503ad9bfc65e7b41063a0c1a2a8bebc6f47076",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3811": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "6835c7992ed93f0d1cd2f4808056eb9c03e6c7f104861026e331e1ade2253ade",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3812": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "59a54bc2ca065fb88b8489102eb6ddc9c6c30c3d41849539b6c5af147de2f611",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3813": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "16029b610a7338a83cd944f13189b16b55ae776add2c2f824c97040482362e0b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3814": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "3743e6240ab0a83d68c308b782bd91f52287b915e1a4645156306fcc2bdca34c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3815": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "dfa5a4eb49ad9d99e0b7d4d0575f8ec15ea498ba0dcede625f50f180f48f7919",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3816": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "50dc779f09147d55ec77b7aa06e18f396b6f6157a0cb810820d41d469ec86d1d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3817": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "ccb50b10f224801eff20bd3bcab9e4758b1ec78056269cb6d673fa0a3aefee59",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3818": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f59540458fecd71b484ad28b3030d16a1cd5a248e20985e906d9d916688cf083",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3819": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "63a9720b365da69b9b96ebace6f2271f1e26adc6a809acbbe964182888dcb106",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3820": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "63694da9b5fb790e6dd6233fde158ef9d14302ba69985fb4bcb6c99c0a8bb3f5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": true
      },
      "3821": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f8becc50f2a8a799f102830ac2d5b8ce25ba239b34d2054d8b4cfdc9b3e1a23b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3822": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "fce319b0f9647c437e41a97dbabc031b0e8109eae11610b2970313e3ac7ec2b7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3823": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "808cf6070dcbccc0a226ab9e7519b9c9cd9b183d20aa1b8dbe824cebade771e5",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3824": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "693b5d037e3ae52b396344caaf3d01c29c0dbbb50acaa17e8d3dcc98e5b5c0ee",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3825": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "dfb6986e44ab05bfe0bc5e2ee4c977ebd9970d1bab6098828828551da60b2237",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3826": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "788a5d005de34bf9c417c639b7d9ad6c78949ab8a2a64c7e37107682dd41ef5a",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3827": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "87dc575be91539ab206eeed574c73dea3d319fed5db26eb7b396ffc5853dc66c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3828": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "60a81864472f3049c66663209205a71f4716179591b94f46253a354afe590f9b",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3829": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "776b83ee85c97456315741800d95d12a62cdd36a2e188f2ec87cdcc3cd9104d3",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3830": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "73bcac08faa4f14937bdac8dee22bd5f2c9fcedbbbcd18c9584c5baa5c875e87",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3831": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "4ebc88d56023ecd7f34b57d04a301ac2d789ac00f897c036884dd839f31301b2",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3832": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "b902685364704e05433c22b9d0a2ca8b3c68d0247d631fddef5f42e2d14318fe",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3833": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "171056d6acd13b2f65c9a4b9b985808f0cbfa618fa86e7519175cf46fa8b40ee",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3834": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "28176fd5cde1bd7327299fe428728606afefd82ed4893419202670a4d8338f9e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3835": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "3090cf44f2bd1e49ee1c7d24fed9402107e7885974fc9e3499b9e9b638b1e205",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3836": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "0e8d510b0db6139e4ec2d9b2975e673386d51568cf8b6edf0d5f96244617d773",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3837": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "3b3442b26055d6a71e4cfc1b9244255e17305caac303ee9b0b8381f3db9f3efe",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3838": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "433cc1d551bb40fba2e5cf15ba263277b6ecade335a017ef99890197ce54c4cb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3839": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "f2f2eb9faf3bbd2ae0225c1bb5be7cc3a100f9da70a3bf001cdde6296810815c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3840": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "4943458f98bed8d20dc7ac084723d0c02d6c10f7f008c4ac3c0ed284ac484ff9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3841": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a39b0c42f57eb29ab56ff78de14d7ce7b16c61e7bc3a322538d5635e65a2dd09",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3842": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "5763831e1d0cf4dd2af538945e18b109eb659f0da6fdaf041fc6b59e6d7a2b08",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3843": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "fa4fdd9ebabbf6b9e982649dadca404fdc88751d41880b3d09a0a05cbf4e5d46",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3844": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "957f3438d78654553c0a9132542ab44002231776e2e8f7672d7df496b0963f43",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3845": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "e1b09abe0a0c353010f1036d234c35539800775037140d320cccd23c269d7e17",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3846": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "bf08873000c410bfefb2611c4f80436be6f5d0c3086950b1d607f654356b5ff7",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3847": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "7e29b1c270c71ccf79c73f413f114673e1ae4de104fb3bf7ad4274c8d12dc6a9",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3848": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "6e251b57d6001e53ba10f1cc9d4b548446135acefe895add07bb7db47193b90c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3849": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "72e295aefd37a518ea2db41980101f56ab4317f474ddaf31a9dfcef4c6fc3109",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3850": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "4b45acd27c065349bd3412ce8693b4444277062cc41f702d7d1c5b5445336ddc",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3851": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "04d197aa6d8d67edffcf341cef0934ec16da39270c099f3fb8feef677db77765",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3852": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "cf6c9bdfbdf1183a3b0ec3d90913aa027849b69a7c63b264204970565229267c",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3853": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "8183215eb22617ff30eb3ff89bee083f1c1f76ce45f8aa79aed4cd9eab7c644d",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3854": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "d2b90334282f945d8345ba8a98f098dfcdbfdc823da1bbecd29fa4210d2cd232",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3855": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "10631b8bbaf2c0eae834368b29f5f1b08e7c7efdbf2531bd567000bdee8cce41",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3856": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "91780aa73041a25e6a0a08a223d3ef51a6861b586bc7b937176a9920e471ff49",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3857": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "859449416d74342ed6a9e7ce27a1edc515cd917b45684e29e392120814c81315",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3858": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "a2622bf6df2fd8d3195d9ae86fd7350fa67dfe37f0a3e0d50866d8bc1ade57fb",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3859": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "3a3b4402343f67b3e2404865332b8256633ab1b2f43e52d2dbd71734fe83d6b4",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3860": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "2a4a74688120d29b9ed361081dd7bd52f8967f847c10898ace5c7c55c5685488",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3861": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "3485b2819d807bc5a994ed3a28a499ee1a662e87ae314423701628cd2f850c9e",
        "review_depth": "full_page_semantic_read",
        "visual_verified": false
      },
      "3862": {
        "owner": "management",
        "ledger_path": "management/semantic-ledger.json",
        "source_text_sha256": "309beeaf7ac012b20e75094519173a22f82bfd667870208b618d866d29e7d2e0",
        "review_depth": "navigation_only",
        "visual_verified": false
      },
      "3863": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ce50da7e1d4192dc7cc48fd965854141200c1ea5df0e667beabb969716bd19f2",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3864": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8d25bdc23f6867d9fc8a2310d0098efdb4924cb87d1b116c9f14494a0fd615fb",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3865": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "108dad83bba77ccf9b91411a48e00d9f3e96fbb41e92a2a41f6225d39ed36178",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3866": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "124d47806edc002919f2e48001b02962b3a0ee0c4d85675dedd2d7ab4e606a8b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3867": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "993bb9d6722504905183ea1ab6ac252c6bc171cdd43442321bdbe09221a484a9",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3868": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "fb73bc7798430b59a27269337cc9f3f10d005ee1d7a369e32c7011eaf697d171",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3869": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bb8ea4e9294ad806794f5caacd3798848a6a0076080e3816a176cc6ed1589848",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3870": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "50f59011c9407db16b508f84bd065b7be3111a4626d62debfad9e8e857be87ab",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3871": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8b18b81240dfaae2700bae9f0f5b00b23d93f5fea43bd9cefd270cfec3f7c4b7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3872": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "652c15a5d4535d4bf2c99370605dd6bcf2983079816f93b93bdbff434a5e39f9",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3873": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "21d85729c1aa440bead5064517bf5c7dc45f31cb22892cb3ea2b14db2d4254e7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3874": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "64677ae268a7ec5477d138a67f5118e40d8e9fb9daf50992351a56ac7c2056e1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3875": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b37fafcef4c9ff7b5fbdeefe4395cf07c6811102131a8a4f74beb66ed0996006",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3876": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "214469c9060bb21ac6bdfca4c1d3c71b67c1c2561ec763eeb50b69094bbcf9e8",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3877": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "68f4d4a9065e92623df3b9d0e04d688c22f654c9da5f38d071ca55d3c9df4b66",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3878": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d9019673d5696c4b5d0e11f5fcd15a4fa428b8c1a44688d6a825632f0bf9f323",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3879": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a202ca619cc35ea7cee66415aafb2d02f892c9d27f6881a8d01e6a61e25277d8",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3880": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "be74d0c39871cb85d4f22b28722b5f7a6be20143588100a4d22d0d3d2502344e",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3881": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "81d9be66136ef2556af16fb8f0a740259ebf033a435a37177310a4e45450ec28",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3882": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6df7a966028aae3920fe32c0770f8bcc653493e61133db4e71f82dec5fbbaada",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3883": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "56e639eeaade21fd2d4b2fba7e3f2bb97fe537d79a6f443bbf168f01e503a5a3",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3884": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "189ab2d243fbc2b6a77398c3bba72da6f90d51f9cb5dc405d2e67da0007b6b0c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3885": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "674fba7a3283f066d59de4736dda0e90dfdabd6ae9f86f6dd73b3c05d25da318",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3886": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6c3ee360ddd43a17e3de790ef0703e652b24e73dced16a381f089b54c5ba57d7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3887": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f556edd00fd8302f439a4d3d36a9acc184009946da069f9bde5744a86d2468c3",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3888": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "359aefef2dd9a2468117a3aef9f2cffc32cdc70eaf9245a7f575ea420a64fd09",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3889": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6b9ee493ba4998d4abdaf2501be10fe6641b93c8802d8cb6ef9db5429bea34ce",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3890": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "83d2b9e8ccd257c1fa192e6ad1c40c2d75153b047d8adbd3de4f33551c32c885",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3891": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "4ca67a53f765b7ab4559f24a29e13e0ce54cd17d0490c95284745279843da071",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3892": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e25a90b32af91db9d65d3eccf4f0577f59028a386ae55d8624dbf20bb1bbfbc1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3893": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ac01e9efbda3874adb6c19f56b38e977668b3b23a3c7c32c73853419a0ccf13d",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3894": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a16af00ab83012e6e8b20b2949e6a9f3db58e5d7ab777bffe27452c9bc0cd0e4",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3895": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9def8b50ac009d674a8b366b958139cbdb4bad7bca98e8f6487bafa52f1ab057",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3896": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6ce55a902dc84f9fa160b95deb1a688557c8e814008707b5c59e1e6806d7099a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3897": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3f59fc8d47520564725c10f466a2b2c02c4ec60bf0c4308f3e1afb0c480916eb",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3898": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1fee0da4f8cd86f1339d3876936e925207e4f53cc1f8dfec3ea05964074bfa6f",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3899": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "c177df4cd6457cc2abb7eb7b5b8354199ad1380c6303fd28a31427e1cef67365",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3900": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6bb8c9d9642eac260fb3a9bc7952a7de02424fe944cbd6b9acc51f84d5bb9f9a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3901": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "03010d00f0a193ac61b2649f507d809ffa9b9418d11093a53a2155bffea6a192",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3902": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d71a9fc65efd86946aa23e92820fc985f3851de8b8b49c72ade917ec779cdfe9",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3903": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "fc10ab024dcb182b148af16335a481add7b15b47d40142cb03d1661a2a2f76ac",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3904": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "73fa0609eb5d00af9ccca470cd15164f0e5153b06037a9c41d2d7b63e03ef65c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3905": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0d68b7dae178678abc8478f3f1878831f14e43f2f1091fa9436c595af2defe2b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3906": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a7bdf06c5d831a49ffb9f76b5958e47d0576d378376d9151905f885ccce00fba",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3907": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "915676832487fc84ed53178419b755c6d45a12ed733c3d1d6a7d193e7876e23f",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3908": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9d4f5c65f1542574ac20961ab0bd4d8116741d9ebe2d5cac93f80197337c0d92",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3909": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e033354b9420ff95fb3bd4fd8d7ee12049efc7daaa28bff6d89b77e297c3332a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3910": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3dd26aa4bba1177e2b3800e614d023d2fb4a2105facaa9e6766d0dfc71262ac8",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3911": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e1f465b9678349b13efecc4bb5059331016d88c5e8668424abbb0bf70ce897ae",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3912": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d554938b95aa2419e5ad94eae47cfd30a1b3f6ad69a04220f2d82718e6b45129",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3913": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "5bc6cf6357e89cb3140d416443fd374f22fac5011f5c27693fa67e52327e0a5c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3914": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "558c129a139aed46f0e2c57f1b5924b690178c587ed63758684062bf9ebec3d9",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3915": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b04959cc165a149d96c5de2daa200199e13eba6cb5fe81aafd5a2c546ea25309",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3916": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "2d19d1de915ca7f687aa878e17709a2f470e9b0ee1db429e1bc243ccdaf10f10",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3917": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e0a5b80f6e299ecbbf2eec76556016af7ccfb5025e22f76e626e749d490b7d88",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3918": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "232fec48e0a9733f2408dfe6c07b9fdd47646894f453042d57bf03501d988686",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3919": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6bf939f34fa74f0d98f6b3e534ca263a2d78c6ec4105e756d0e7cdf14c70123a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3920": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "86198cbc3206eafe926b925566f932c0b54c9b19a69d2a0ad24182acd09e59fe",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3921": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "73c7b5dd7389e02c3b1626475c3e34511adbcf8ebdd92d027e02a662c798c41c",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3922": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "14904acb7d5ca65112d99eabda0479b55d8f68150e76ab0c9789c53d4413ca77",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3923": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6fc412d6639cf5f82a5f24f316147d86d5093efe71b3fd09444f27b6f739873f",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3924": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bd77c14d46e3bcb6915721b930b9a0c6ef4f808953801ed7184efad64f2cd6a6",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3925": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9a819f2c477865948421fde8e51de1043e0dd4f9659ea48b0bd31e1e0f254b2c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3926": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3708d4eca2b5ec6e4b35942f941bd37d1dcfd374f9682ac21f6724530813035f",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3927": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7e5d7a87fbab8882342c4c35dc542cd906bb075b1bfb06681c9f20c61c7349ef",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3928": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "195da36e0ed87c5ebdf1b5d690d2f6a04585e58f5710b6f7e1e28479929c3e6d",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3929": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e4d9a6d4fe229127ab6503b121ff8ae52dc89900222bd0ee87c8f035d1946f0e",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3930": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "859a7dcd84a3e7024cfec0e8d285351c66e68249ff1834dbcb26def8d93e104d",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3931": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f4df03408ece0829201c936eb02b3a1895c4859fb7e9e27498a9673c851cb79a",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3932": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "283974de04f46b65ef1491193a9bf3dd755bc959456ad603bde2698221922fbb",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3933": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3811b96b65ebd3ef3b414b50b12cb21042a5619b3bfdc783a718f9b32d9023ec",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3934": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bb94dd5500c62ff832e17d31caa68f170b2987174eb5aaea0730f6fedbbef0a5",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3935": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "681ba67634d50bdef281e5d59875f0bde3a48316f71907ad6d65d04977705adf",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3936": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a6e647dc0381d453806644be273eb585f2da863d41d81119a98092ef2cec5491",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3937": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "2ba7ce8b84ac296e02a554b0741560351959a9320d2de95f931276788b06b6c7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3938": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bf40c38db0610396ca2228e37c1d385d5a498ff93282b3944f86c3c1c3c8840a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3939": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "fdbe789661da1e27bbb294b2fc7dfaa46f765e6db301eca2058a109beae5d4c2",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3940": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9ab68b38a3d5762afb812ac80d7d8a768e6fce2eed461118904c068db64f4b8c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3941": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "01ac67ac98fbec976fe24905f1cfaae8c04271198f14ce9efb3eb3f8a8c7a5d9",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3942": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d3491abe428069887d703fdaf26d70422c7afb5802f9be0a8d0d2a15d9752eba",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3943": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "2d8f1bcc26b718bddcfaad0b033d834f2a5976c0898db2e2c132a63c8ad70f2c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3944": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0beb068f48235fd80d232d74a75c493dda24aa853ef411e0b975d8a006edc2ff",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3945": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "266d95640044b685b6c4414198244c54c80c01836bf7569e438eed3e3567c6c6",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3946": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ebd46802d0fd77b4ce7769f9125d9fd06342420702ff1ee9faf113dbcde426e5",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3947": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "2ad29acfc19f3b43abd3ee5da83b4c74412e9939d04d1cbdc11a5a383c562829",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3948": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "dbd47007961adb063986e523b31e70e63a7c5afbfdf8d79198385252dc437a55",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3949": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bbc983702c5f2cdf20612311e9430333abbd62558013b29dab7dfbd10b4879b9",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3950": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3a28acbef8f26f0dccdd64ef2bbbc079de421159db3a6e896be6d2f19a6a2793",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3951": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7e09139ada340a5ee434301885b6b3214b3224aa8e40eb7a169e4ef35733237d",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3952": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b970ee16ef8f4e20c09b742e22244853093bb1c266e87737d9eb5cd11a86637c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3953": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6f0a1c6b4d56a143897fb82356ff58a118c8fbedb6683c10a9b143d895ead589",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3954": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "4365484b90fca35da350585a258ad707a1e99f6492eb79d957387d53517bc884",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3955": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "eca51d6f47f07bdf7b40228c393ff80f25f93fd37ba725997916b5d392ea61a6",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3956": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "4c85416d6902a7a6fae1505ed1e609985a7942748ff97029e97a061a2b0c5217",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3957": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "82d7216b05d44d3268e1126205c54c4e1ebe9824ff1a562cf49b3836e3420356",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3958": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e4aacafcb4e3d9bbf4cf16588627c8b7f46ed60b84f8055e555f4fe28bcd8cb0",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3959": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a655b533dc38711e68c91b06aac506d450a16e7e6020025a4fcc3a849964b23a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3960": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0c0999ee1d43fc0c9546cd05be773b27052a3844eb89020579312b83e1d6462b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3961": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9769aa5c7736c5c80056d38ec8c341038501e903b17cc391f497e4afb0c6e311",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3962": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3ebfa5102a1a790d822693524ee36ed6132236de87ca8acd7d7297d3d3bc27e0",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3963": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "cd9d52c3c92e32e0bd1bca64ea8686a781df96b0792f10a033e40d5cca6a1a87",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3964": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "19f20f31e68073c3ee39b1e7ef144da66f76101c042c545d9c64c1bfde03b074",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3965": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d79bbb76d64db5f21d62b697027ce22f1c51a9ea14a2c6c6e9a2d35372bfcfc5",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3966": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ff0f691651dbcec4c90cf07c457e15cc97977c68290b504610a82b50a638ecb1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3967": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3ad437eaef34166c779cc91312fe6237c6c45420fb2f21b1baaf5ccf51bcfc35",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3968": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ade9c79579fed0b61a66bd6928efb59fe089cca758bb439de2e88902dc501d74",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3969": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "09575171ac5a682bfe0265904b4d3fe322a71f86dffac6a3948476ef0f1567ce",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3970": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "85239ec5f209ee9c0bc79f531fed4930aba5805ba0c055a8e483f9fc4d52f5aa",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3971": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "01df61d70bff53087a53a2ad02349154572de00e35d506d331cebbfb23af887a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3972": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "41d552e4d23bbc634571a148463bed892530c3e7541bc8287a31282ef43b7d90",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3973": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0e3aa95b6cad966cfef2151f67c2795877d5438d1aafa5af60f98cb77af3c3f3",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3974": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e4f07d7f5db7e559412c647783badc922d06141650bdaf5a0e38918ded1e9250",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3975": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a5abfa6c120eb4ec1dba672cb359cc9d8771d00effc8fc389bd5eabbc3b3fe9f",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3976": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b895808e36254c2a0953be40b08f5b15b752e9a535002170de6daf76bc1cc178",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3977": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "945e94aedd991b65d70ae9693dde37ff1b2db378aad3fcd42249edb0ded00a60",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3978": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "2936b1e907dff1ac7c25013a93c504fe14ed5c4be22fe12cd650ae64026a361b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3979": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d5c6a50d90c23e9f9645c8142904e2ef1f41a8cc6a443f7bbfabc063d757bbd0",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3980": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "adc65f19c5749223509fcbd30c367da82967f5da413cb62ff34bfb24d63ceb62",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3981": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b46b0034153ff1ec4c224a1ce446ce0d835c76cea9e1d685f67d8b8d03514f72",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3982": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bc741e8fc34c45e799f3f8ee188caac9fca8a05f186df276355a2746975f6ac6",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3983": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f1fa3a5441697d325fdfa5c562e02a27deb1f49efd8f1038826883c56c03c34b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3984": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8d563e8d8f6c11b5dfa61216085c848a2846899a0c73a80dc3b6e23a2c90fd51",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3985": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f5ce083e57e9b19e7846163702b2b76f064c0b12908ea62312b2eb5fa8a46b4e",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3986": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7d91fa75e60b6ab836b2b0e988d694378df520adacb80742a2ff4aeb2c0ec0dc",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3987": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "dfb01be60bf57ed60bea04b6aeed84839e2c11d63e6e408a32d495077d67a6ac",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3988": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b1129d769e0142953576108a7e293a0bb89a71cee461e20573cab307d47a92f8",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3989": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b306f62a798bd40730131d1772f6f81482348f8b9efe9602ca254644ce4720f2",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3990": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e531b59dc397de2e6e65f5d8196f4a8915c86953ec2949f0551e699fadc5915d",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3991": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "251a02f5020438d0a731a18653797074f1fa67d8c6a84aca6bbd439b5e17875e",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3992": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "033437554d10d24ba1612c6335aa9209370cb2721f6054316101c77c34f66a10",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "3993": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "427d95c9b1239a872e09d58cc123512b07aa3b9b7e2798c61336b577bba2769d",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3994": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "839cd8583379d1b1d73bf352d2faa0d84287867f386006918063e22409b0b219",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3995": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0081f776d18e2dd668323eb85808525997fe9a506fa13843b2809b89b9dfef76",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3996": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1606a74ecda4070c6b9f25ee9debcaacc8db5d1f80b33667c9d087784bb6ffe0",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3997": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7b66f9a202dcaaf40adeef182a70f3c1e39c2f511d812f8fa130599cc36281bd",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3998": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "4c29ac96f60021891544c5ab8e65de4e02048c86e04719de678aa73af6e61995",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "3999": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "df70a94a88bcc31fc6d26a4cacd86ef1f011d44701e068e69afbb7369c1dceb4",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4000": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "701f601de3e6c0bf245b847a7d879cc93f9c89f8c4fe60c97df4965a8d8baa97",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4001": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "4d6eda63a6a281a31084229ec19ea6b83a45796ca8295614a0eaeed1c23b4e49",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4002": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9f0e752320d5ac95dae38d5b6a4232a7566ed95f48e4e4aa72b9723455c5ef86",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4003": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "db3bdcf3cfba4cc81c2a0672f0e32fc4c7ce8f51f5000a468e99f48b81b8198b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4004": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "940a0e69e3ce9635c91ee6ac5967f4a8bc0a967bab060b2a60e8e1cf3c258858",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4005": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ed8e246223c36b8444abf0a81427bcd1301114dc5eef5cf0bbc6b9677f7decfa",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4006": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "68a94b900c8b477e4bd7d5caccea9d92b0a499c9f1f493366bd887ea88770eb1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4007": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ecd0c4fe5b26dd214ef6ad1664ae439be04796331ffb8cf105f916b76b4420fb",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4008": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f5283f9274513302792d460263bc0b7fbbb5808e5b0d2939e37d685eba62c886",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4009": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "eb6cda7a79756d9e5b4b8a30fa18742a7b36f13ec72e8efcd8f50abc6cb7dee1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4010": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "4a370c9daf704fa371fd5e58dd08380fd8122b01a630d689e7556fc5830d712e",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4011": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "53218a6a7e325d5b56f29676bc452199e9eff5ddf3bd0be4d63544b791a4ec69",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4012": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b77a7af4d18639dfda638c3f3d8902e9c12331df9ceaabfe47c9eb72d785f6fa",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4013": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8de02704093e2c63253f52368585d34679a7e4f6a2471ef3ae18d58ee63ec22a",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4014": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "70a7301a69b34b9b3572e9b2fbef29885e883fb2b5dfbb026259c04eaad1994b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4015": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1e9b1630a26e8a2a2c436198b59e24c1d8a5913cbed7cc6af5f66ae0271f25c8",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4016": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a64f3e08434c7f172693705ec2d8ca70c0be869a13e46b29fd9e75842bb2ef4b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4017": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "c184f2a20d7ac03112278ae920ba757fd78f6d5c7bcbb43579d386336c79454f",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4018": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0ba763e0eb114e74e78302b1bc920e394cac7f10863808f51be736732912a3d5",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4019": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "535ce47c3ffdc0a69d70a6626c2d5a86de9d058128375e6645d5feccbd2fc4dd",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4020": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d2a0828c61e2605bee3036e3ea30ba376a6892c0b32f9d78ac1b8bca4dc2210e",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4021": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "dc13e06f8867c8ac03ad6f22fc3a588678be48c8a9936c20dbce8d566cf55e86",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4022": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a1334be2fa148329b3c0c3d9df838a5a2744d96619ae3e6d962203defd557448",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4023": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6de4ce8c70a078506269fe907ad2aa813e6f35c0f7e61d38dbdb2950bd9bfce7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4024": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "c4063e6d9971a8ff77117c0de480e227b69b661a954895b3869153bb72f9a616",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4025": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b1ad0eb38f0800764e829bc74ef6e57021f2a5b379e57cf3d6bfb2af11c90aef",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4026": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "03b04526ff9eab75aa185fe9f44831419f61bc09aa0258abfec6f13a9f53ef94",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4027": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "806b78b1a19040e79d5144eae7f9fc6e53393e2f5ae0e01c387c264ba6edf389",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4028": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "2384bceeae71655eb9095a4768ecefeb9d494c0c31c15b15c0f8985cf42822a3",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4029": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "10d062561d7930dc1d06c4df5067817c6a927458cd59cc11e02f77a0cd702e78",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4030": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1996b1fc23c026528278c9d4b7e6030db7123425224d97e2d970e92e3093c6fa",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4031": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bd1ef4d6488ff7619ce00eb03b3fbe8ee982551882238b83521f298e8da0b420",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4032": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6f64a39fd6c9f1208c43913370a91f0bd7cb8791a1f44349d9127ba8123a5c55",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4033": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7e90bb305856267f371e5a80b8ce867179e7943aad130f19e54b62be4bc3a1be",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4034": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a186361d26fb9d94f8704442cf30da3b3620d5cf15568ca65e1a83f980a6a4b8",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4035": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0d871757cecdfcaebd293e03f7cb15e63da3b6f3fa10f9ba4cb9440236a97bd4",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4036": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "0653690e3675c966d64de2f6fbefada7836ab4f5910d1262359966c6ab521111",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4037": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ae455d09b1a0e0cdc1879bb99dc19b3bac686156ae25b101daf34fd5562d53ea",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4038": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "64cf1e9442ff905998075a8694799c23a7503a1784f7217e60708ab86fa0a25b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4039": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "99c6893880f86259cb88e662139b7287c41e53a34581f9699da32a84b4ba39c7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4040": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "033ae81f69f7df4416f658446ade9f75525e37edad1887caa1b33b26ab3572ed",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4041": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9acaf18497f66f9e7abeb96b697b7c0674c388a4c74ce8a634ad71a71930cce2",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4042": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "26b79f36d337abb7f6953ced51574009a1b5a526270250bda0910a63d88480d7",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4043": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f1d9e31d117fc09a2fb057ec3bb10b9f06ce5ca74d9ec00ed487c455d756f327",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4044": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "333b58255ddaa0d480a2f7b9d360b7298a113cfb73014c2d6c425156b609991e",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4045": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3e52ecb15e9e5b8660d05027edaa135184d8c790a5fa142c4b1d742bfea8549b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4046": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "299b8a3e9fa8d7dd4fecb2178ceefa7a5ae953fcb6cec1dd6bc7b92f1670ad39",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4047": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b52e9102138d92972df30858e686c2a333a6d5ba47778e43f7996610930f0e73",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4048": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b293c433e06b4c4a119ff2e6de2338f294386ca4dbb009aa043808aa260b26ca",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4049": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6813a43f6b66b5ef3d03238566133b58e8ffd255b3f6c5fd528e366fe7d91826",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4050": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "fbd9666bc04da82825f4634bb29be16e912c10a07977389a090f7d28ff6cf878",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4051": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ea88a501619a147b50fc199ac997b92f5176a3d1d5f3beea9eee60e89f521b10",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4052": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "96d2eb7585bc06f8306061651ce9fb0ca28834894465285f47523b6659f2d602",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4053": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "14a56d2289330ecea541d633098681eb6058e307f702dfa74938ee74c3ceb474",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4054": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "bfde4a8b046fdfe926119b0de981f993b33ed4c408e0f7153572cc1c2160ee43",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4055": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8419aafec2d8d1f25e438a81c8d286902c801ab09948efa69e56a463dfff9215",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4056": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "c86cd2886ab47cb9349b03b5038de7e2a0c444d768518f1be433f764c2b417be",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4057": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "754f2c1759d124aca509c9ceb3a9900125161f7068f968e97d203dfb60e82942",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4058": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8c03936da67fc35d34c4b93a6c23fdfef0b7e2cee107f37dfc52d035382664a3",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4059": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ce313bba5cce4dbdcafd91e6485bb47aa4024513705e9296a7b381a81f88096b",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4060": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "513ba395d2ff16705fab561322dbc0a457ae231443bcf2124192e8758fdcaa29",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4061": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f09d7fc8afcfe35d9c0c4936496e01fc74cc6a9e6df4297a789021f2d414521f",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4062": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "c6bccd6758696d49195bfd8661bdce829179ffee71a5be4e7fb61310d6b962b4",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4063": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1f67bcba974685eb2d5b2c37f2782fac57fb6373bec0fe6053a26c5f8eddb914",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4064": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7f5642f6fa439158412dd1b599fca8dd042f80cf59f146e992e36e94b8c793b1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4065": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b3cde308bb2db0eddcd643f940352b29476925f2eebaa84564c22ce033518db8",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4066": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "9de693903772abf8706a443d8360d60c612e8423c7b86462dee30b1f1817896f",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4067": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "cc7fbc01c0de05ba929c8ae3b0aa5566652c1a81369ab4fd23af239eb9246c13",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4068": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "31d03626df424f70ed74687fffa2e76c9bf7007401d5f4aaf8aa8c5df195ab9c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4069": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f40138c9d9e26dc84e04f07db8517fee98536b24bf972778aebdb85f2cbc1379",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4070": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1011c04cdb82cf354506ce03f6bff36fa504e302a660611eb4d00c04984d1529",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4071": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "43d79a5982e898804ec68cec1c6901e488794844e67d6b72af17a5bd7641d3d2",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4072": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "03ca6a6412ae7ff63e5f593d5ea015269ad42f20c92fb199e4a0c050834ed75c",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4073": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "aa2de1e24d0f145426da2b51ae195a6bb5b4fada253293961d09de13017812b4",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4074": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "85605238ed5ed3e4458cac82dd0dd6d31a6d0bb55b04d16ed5c1e1b31608ef39",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4075": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3c99b2191b4769f2a9d7f6f57311c6e14abf1e05848daf58c620cb7841eaeca1",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4076": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7ca97a0a915b101053a5dba5d9928b68997c22afd2265eaf74e52dee1b27d849",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4077": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e11ab1d2391af0b309c0ff68f3a20dc89a791bd94586db4188f7624ed2f29499",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4078": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3e3157bf449a2da986c80b5550fa501146340760b2a0ff5453582a8f8a705eca",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4079": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "58127c239bda7854f4f34568510f98529d36cc28be95d5a342989528cf9b3d6d",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4080": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "380e6ffdc131d00d650736c567d9fb97927b17934de13066287df5adfd356486",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4081": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8f560540dcaf1c095ffb9b49411819b7bcde5489c758dae737ca8fdfaf830dba",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4082": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "634afca8070315141e3c8365645a47da7705781e6c41ee0d561dca9b41a354dc",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4083": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "00dd78026d8c539a43bde51a194d9080aed74e003a576919e5f82ebddc7b0da4",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4084": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "33211853ed15b3bc22505f84dce77e2248d8f4e188d3f1b0e7b5f0eb6c400228",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4085": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "1c366f93c6ba82fa446e82bd69744adc768f9ae242601ab69998c616539911e2",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4086": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "92bccb64ff1e1118f765234e1b76056dd447c224e71ede324548268ef649e6fc",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4087": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "19e5be55f59fb3e25d06623f808f62cf4e601b6e4419101bbe415450ac8975ee",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4088": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "a87e523413fc0ee88d934438de00ac2f052fa37a6c6752321ff87c32ab1d6d02",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4089": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f53e046c9178a36ca7475b51711ff57fe199c1305109d2cab02ee0321c6c55be",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4090": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "61261db84e127ac48b7837417323cbb5558e9d9a6ba513aacd59f9d353e4ab93",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4091": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "f02332e89b0be6e8d30edd9c3d8951825e8c583afc588e56357584542b567b19",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4092": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "6857980ee64a01f5f67c5b6eea377823159afcf0ebe43e836aa855a8b0025781",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4093": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "8dea323f22b46ac70a9ba07bee8805a971c5188f571fa16b6af92ee7741fbb89",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4104": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "ad695038f147012451512cc5ce9cb1b7e3b4b8dc508dfe022964046e3110a13f",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4105": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "d0b8cd7a9199cbd8ac3074270c90de5799145258a2a4e358e6b2a7af8af88ec5",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4106": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "b5f326e8e42f15626f46aec8805c710cba017f2e560da0761e3332c4d1281f20",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4107": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e8491531cee9d22015b6aad05125462c15f9ef2af8eccc4fe7164dc96db76365",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4108": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "7046824fcd48b447fc373c61fb02301dd1f5b46ef5198798c161047edb1af8ec",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4109": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "3e6915717f519ead3d99d2258c433657cb0da7e7ea87a771f95c53d120e205d4",
        "review_depth": "semantic_read",
        "visual_verified": true
      },
      "4110": {
        "owner": "sustainability_divisions",
        "ledger_path": "sustainability-divisions/semantic-ledger.json",
        "source_text_sha256": "e1271925a91dca5262a20ffdd8b7d037241e80eb9faedd897369f9322d359426",
        "review_depth": "semantic_read",
        "visual_verified": false
      },
      "4094": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "6662b7fa79d7db8515e111ff306ff3c5be150417b6065a719e6472383f18001c",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4095": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "0733198ca87d0ef620a8b288feb8757750d0f0c400c72f62e4f94132b9a439c6",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4096": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "d65eb95fcaa630b00b414d3b7ac0d4079f4df8680b2102e14e32c949569dd6ee",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4097": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "5382b039e17453eeacfa04cbec67cf4bb62e782d89124c55435b452a97f81819",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4098": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "5e11790f2ed8e305d359b81b6bf3a0ffcfef0353bd16046b537bd4772b4149f9",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4099": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "680681b5826da198a8d62709f58f775fc0ab898f6ec883d621e79b21403e809e",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4100": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "1ba74bc26ba91977c7e1c98f6ef4468e3cf2ba22ff9390aab34b3ead967b9fb0",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4101": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "471862c98f12fc1d3c2709fe6155f7e388c5c26f56ac92546e5f15728e6a9f6f",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4102": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "a6c43a3e180464343b27042adac86ab268ecfd61cc3539eb28ad8a70d26c591b",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      },
      "4103": {
        "owner": "annex",
        "ledger_path": "annex/semantic-ledger.json",
        "source_text_sha256": "bfb157333168ac0c04211135b5cbfb6ba71d9071c22bf036850676af1bcc85a2",
        "review_depth": "full_page_semantic_and_visual_read",
        "visual_verified": true
      }
    },
    "limitations": [
      "Semantic page coverage is separate from completion of selected models, visual QA, independent peer review and application integration.",
      "Physical4092 supplementary annex visual review is not counted a second time.",
      "All counts are rebuilt from current ledgers; no historical79percent claim is used."
    ]
  }
};
export type VolkswagenPrimaryRow={id:string;label:string;values:(number|null)[];displays:string[];sourcePage:number;sourceLine:number;sourceLineSha256:string;sourceLabel?:string;context?:string};
export const VOLKSWAGEN_PRIMARY_ROWS:Record<string,{columns:string[];rows:VolkswagenPrimaryRow[]}> = {
  "income": {
    "columns": [
      "2025",
      "2024"
    ],
    "rows": [
      {
        "label": "Sales revenue",
        "values": [
          321913.0,
          324656.0
        ],
        "displays": [
          "321,913",
          "324,656"
        ],
        "sourcePage": 4112,
        "sourceLine": 12,
        "sourceLineSha256": "5828804d88196e5c3493868388e210cbcb716bf561614fe99b1f0ac5c4eef0ba",
        "id": "revenue"
      },
      {
        "label": "Cost of sales",
        "values": [
          -270671.0,
          -265184.0
        ],
        "displays": [
          "–270,671",
          "–265,184"
        ],
        "sourcePage": 4112,
        "sourceLine": 13,
        "sourceLineSha256": "e2b8932c4ed9a3e0d6c4ed328291f5a4311c345a4535b4ace43d9d2d15df58e8",
        "id": "cost"
      },
      {
        "label": "Gross result",
        "values": [
          51243.0,
          59472.0
        ],
        "displays": [
          "51,243",
          "59,472"
        ],
        "sourcePage": 4112,
        "sourceLine": 14,
        "sourceLineSha256": "c5f0b21e422cbbdab03af76c44f1bddcb15f2f17294f955179f4add1be036d3f",
        "id": "gross"
      },
      {
        "label": "Distribution expenses",
        "values": [
          -22804.0,
          -22320.0
        ],
        "displays": [
          "–22,804",
          "–22,320"
        ],
        "sourcePage": 4112,
        "sourceLine": 15,
        "sourceLineSha256": "7237734c9f1a46b9b8138a85d35285ae732a63ee223e532f1ffe5019103a87e8",
        "id": "distribution"
      },
      {
        "label": "Administrative expenses",
        "values": [
          -12541.0,
          -12754.0
        ],
        "displays": [
          "–12,541",
          "–12,754"
        ],
        "sourcePage": 4112,
        "sourceLine": 16,
        "sourceLineSha256": "82007cc5a8c743007c403fb17f1440016c0deecdd897a6443f7aaa5616770a4b",
        "id": "admin"
      },
      {
        "label": "Other operating income",
        "values": [
          13615.0,
          14974.0
        ],
        "displays": [
          "13,615",
          "14,974"
        ],
        "sourcePage": 4112,
        "sourceLine": 17,
        "sourceLineSha256": "a8f3e0096d1e18e48e6ce0ef9a8e640699c73160bafcefc39feb3c4dbc803e42",
        "id": "other_income"
      },
      {
        "label": "Other operating expenses",
        "values": [
          -20644.0,
          -20312.0
        ],
        "displays": [
          "–20,644",
          "–20,312"
        ],
        "sourcePage": 4112,
        "sourceLine": 18,
        "sourceLineSha256": "c400f50a4f96c0a88d846eabf45418b5dd9402f8d11387c982e67ade60064938",
        "id": "other_expense"
      },
      {
        "label": "Operating result",
        "values": [
          8868.0,
          19060.0
        ],
        "displays": [
          "8,868",
          "19,060"
        ],
        "sourcePage": 4112,
        "sourceLine": 19,
        "sourceLineSha256": "859b76291b782233c744d1a6458fe8f65bb6d6d89aaf8c9fdb0562f958a90474",
        "id": "operating"
      },
      {
        "label": "Share of the result of equity-accounted investments",
        "values": [
          930.0,
          375.0
        ],
        "displays": [
          "930",
          "375"
        ],
        "sourcePage": 4112,
        "sourceLine": 20,
        "sourceLineSha256": "42482000151ce9faaa453b45a9c970c97ac179be088b10fa1c94b8d40765c271",
        "id": "equity_result"
      },
      {
        "label": "Interest income",
        "values": [
          1824.0,
          2419.0
        ],
        "displays": [
          "1,824",
          "2,419"
        ],
        "sourcePage": 4112,
        "sourceLine": 21,
        "sourceLineSha256": "750b2eb2b5b077b787dff2945f7228becf7323bf763dfb56963af18a2ea95aea",
        "id": "interest_income"
      },
      {
        "label": "Interest expenses",
        "values": [
          -3245.0,
          -3446.0
        ],
        "displays": [
          "–3,245",
          "–3,446"
        ],
        "sourcePage": 4112,
        "sourceLine": 22,
        "sourceLineSha256": "9fab850c683febc52187e5ce7786b669aa519626aed92e12adaba6d7924c6ac0",
        "id": "interest_expense"
      },
      {
        "label": "Other financial result",
        "values": [
          930.0,
          -1602.0
        ],
        "displays": [
          "930",
          "–1,602"
        ],
        "sourcePage": 4112,
        "sourceLine": 23,
        "sourceLineSha256": "7962dcf167b3ec12b17fcd02ec14233306769eb4725555df37656876a3269a1a",
        "id": "other_financial"
      },
      {
        "label": "Financial result",
        "values": [
          439.0,
          -2255.0
        ],
        "displays": [
          "439",
          "–2,255"
        ],
        "sourcePage": 4112,
        "sourceLine": 24,
        "sourceLineSha256": "f6ad2dbcd37bd139206d4c9c273ee9bf59df4fde1bd076061d26ec396d6d8410",
        "id": "financial"
      },
      {
        "label": "Earnings before tax",
        "values": [
          9307.0,
          16806.0
        ],
        "displays": [
          "9,307",
          "16,806"
        ],
        "sourcePage": 4112,
        "sourceLine": 25,
        "sourceLineSha256": "11aa19bd3ce3bcc679beeff8967f7d2f33a0de711bef66fb73e9a70445bd00fc",
        "id": "pretax"
      },
      {
        "label": "Income tax income/expense",
        "values": [
          -2403.0,
          -4411.0
        ],
        "displays": [
          "–2,403",
          "–4,411"
        ],
        "sourcePage": 4112,
        "sourceLine": 26,
        "sourceLineSha256": "d5946322373d8348a5e0d33e2e9868b9393e7edbd9d4990c721b3eb1fe692155",
        "id": "tax"
      },
      {
        "label": "Current",
        "values": [
          -3837.0,
          -5858.0
        ],
        "displays": [
          "–3,837",
          "–5,858"
        ],
        "sourcePage": 4112,
        "sourceLine": 27,
        "sourceLineSha256": "db0d94b217b9d17f1ba79d5b85403ddf09130af29e82aa65294f737831d32657",
        "id": "current_tax"
      },
      {
        "label": "Deferred",
        "values": [
          1434.0,
          1447.0
        ],
        "displays": [
          "1,434",
          "1,447"
        ],
        "sourcePage": 4112,
        "sourceLine": 28,
        "sourceLineSha256": "83556f808082c161eaf1eab5c6cf013fe71656cd0dff8c03a0d2def57188db65",
        "id": "deferred_tax"
      },
      {
        "label": "Earnings after tax",
        "values": [
          6904.0,
          12394.0
        ],
        "displays": [
          "6,904",
          "12,394"
        ],
        "sourcePage": 4112,
        "sourceLine": 29,
        "sourceLineSha256": "14f9e5ab2d63d16080e8809623d76a9ed351921a3ab6784b52845941fdf67a38",
        "id": "profit"
      },
      {
        "label": "Non-controlling interests",
        "values": [
          -419.0,
          1043.0
        ],
        "displays": [
          "–419",
          "1,043"
        ],
        "sourcePage": 4112,
        "sourceLine": 31,
        "sourceLineSha256": "c0ecfb6319a026dac2f09a20a16b2c4943bbbb7d22c5a784970bc287c90e1b81",
        "id": "nci"
      },
      {
        "label": "Volkswagen AG hybrid capital investors",
        "values": [
          650.0,
          630.0
        ],
        "displays": [
          "650",
          "630"
        ],
        "sourcePage": 4112,
        "sourceLine": 32,
        "sourceLineSha256": "cd81fb28445e6bf2454b4cb269febcca571f94348abfe1bc8a5c1badb977085a",
        "id": "hybrid"
      },
      {
        "label": "Volkswagen AG shareholders",
        "values": [
          6673.0,
          10721.0
        ],
        "displays": [
          "6,673",
          "10,721"
        ],
        "sourcePage": 4112,
        "sourceLine": 33,
        "sourceLineSha256": "46d07fccc647e9fa42d62e0e3600f24a4f87254f1d2dc02514b366f22639182b",
        "id": "parent"
      }
    ]
  },
  "eps": {
    "columns": [
      "2025",
      "2024"
    ],
    "rows": [
      {
        "label": "Basic/diluted earnings per ordinary share in €",
        "values": [
          13.29,
          21.36
        ],
        "displays": [
          "13.29",
          "21.36"
        ],
        "sourcePage": 4112,
        "sourceLine": 36,
        "sourceLineSha256": "9ebc79708e686b3f53dde8628e560033c7b42fd8d2fa4589a670ac3239a8d9a1",
        "id": "ordinary_eps"
      },
      {
        "label": "Basic/diluted earnings per preferred share in €",
        "values": [
          13.35,
          21.42
        ],
        "displays": [
          "13.35",
          "21.42"
        ],
        "sourcePage": 4112,
        "sourceLine": 37,
        "sourceLineSha256": "1be8618310c3d6f56678767071f4dee2a39a628f48079429408b6bd834f48400",
        "id": "preferred_eps"
      }
    ]
  },
  "oci_2025": {
    "columns": [
      "total",
      "shareholders",
      "hybrid",
      "nci"
    ],
    "rows": [
      {
        "label": "Earnings after tax",
        "values": [
          6904.0,
          6673.0,
          650.0,
          -419.0
        ],
        "displays": [
          "6,904",
          "6,673",
          "650",
          "–419"
        ],
        "sourcePage": 4113,
        "sourceLine": 17,
        "sourceLineSha256": "59f88629f2e38d85ebbc6f7758bff6fbf8cefc027db211358d70cc3f0efa2af0",
        "id": "profit"
      },
      {
        "label": "Pension plan remeasurements recognized in other comprehensive income, before tax",
        "values": [
          4782.0,
          4566.0,
          null,
          216.0
        ],
        "displays": [
          "4,782",
          "4,566",
          "–",
          "216"
        ],
        "sourcePage": 4113,
        "sourceLine": 20,
        "sourceLineSha256": "00cdfa4948b717d3cf35e6269aa15195b95e15bae7874831039c96b6f5ca0231",
        "id": "pension_before"
      },
      {
        "label": "Deferred taxes relating to pension plan remeasurements recognized in other comprehensive income",
        "values": [
          -1404.0,
          -1351.0,
          null,
          -53.0
        ],
        "displays": [
          "–1,404",
          "–1,351",
          "–",
          "–53"
        ],
        "sourcePage": 4113,
        "sourceLine": 22,
        "sourceLineSha256": "adee31d1156d2a830c74bd7f3edbd10d2bc4322e5fbf01bacd24f765d5bc3ad3",
        "id": "pension_tax"
      },
      {
        "label": "Pension plan remeasurements recognized in other comprehensive income, net of tax",
        "values": [
          3378.0,
          3216.0,
          null,
          162.0
        ],
        "displays": [
          "3,378",
          "3,216",
          "–",
          "162"
        ],
        "sourcePage": 4113,
        "sourceLine": 23,
        "sourceLineSha256": "18f827de123d5a7845d1ca26855acbb8a0c4b53b28f9597503bd798dcd4355c9",
        "id": "pension_net"
      },
      {
        "label": "Fair value valuation of equity instruments that will not be reclassified to profit or loss, before tax",
        "values": [
          1441.0,
          1377.0,
          null,
          64.0
        ],
        "displays": [
          "1,441",
          "1,377",
          "–",
          "64"
        ],
        "sourcePage": 4113,
        "sourceLine": 27,
        "sourceLineSha256": "45c2d79d30a6e272429233ad4045fbcde8aaad78e592facfcd74451d98c3c2a8",
        "id": "equity_before"
      },
      {
        "label": "Deferred taxes relating to fair value valuation of equity instruments that will not be reclassified to profit or loss",
        "values": [
          -264.0,
          -263.0,
          null,
          -1.0
        ],
        "displays": [
          "–264",
          "–263",
          "–",
          "–1"
        ],
        "sourcePage": 4113,
        "sourceLine": 29,
        "sourceLineSha256": "0a99b1a20a8c3c6f58c78b51de517cb98bf1dc00a4a1e477d34bbaffdf63775e",
        "id": "equity_tax"
      },
      {
        "label": "Fair value valuation of equity instruments that will not be reclassified to profit or loss, net of tax",
        "values": [
          1177.0,
          1114.0,
          null,
          63.0
        ],
        "displays": [
          "1,177",
          "1,114",
          "–",
          "63"
        ],
        "sourcePage": 4113,
        "sourceLine": 31,
        "sourceLineSha256": "aac2485809f2117785c1b331a0084fc2013a75fd4b5d69573a5a6820e6fb2f7e",
        "id": "equity_net"
      },
      {
        "label": "Share of other comprehensive income of equity-accounted investments that will not be reclassified to profit or loss, net of tax",
        "values": [
          -5.0,
          -5.0,
          null,
          0.0
        ],
        "displays": [
          "–5",
          "–5",
          "–",
          "0"
        ],
        "sourcePage": 4113,
        "sourceLine": 33,
        "sourceLineSha256": "22ab91742fa2411ccca501ab30ab248b0e0bbd6fb24ccd843aebb471059f7b07",
        "id": "associate_nonreclass"
      },
      {
        "label": "Items that will not be reclassified to profit or loss",
        "values": [
          4550.0,
          4325.0,
          null,
          225.0
        ],
        "displays": [
          "4,550",
          "4,325",
          "–",
          "225"
        ],
        "sourcePage": 4113,
        "sourceLine": 34,
        "sourceLineSha256": "d05c7c9785480abaa62281bf95463f0e5c4f733e30003d828b097d746dfb085b",
        "id": "nonreclass"
      },
      {
        "label": "Gains/losses on currency translation recognized in other comprehensive income",
        "values": [
          -3371.0,
          -3255.0,
          null,
          -116.0
        ],
        "displays": [
          "–3,371",
          "–3,255",
          "–",
          "–116"
        ],
        "sourcePage": 4113,
        "sourceLine": 36,
        "sourceLineSha256": "50e54acd5a405def38239376ce21155bdd2fe613bcd253b487deabffe6349b96",
        "id": "fx_gains"
      },
      {
        "label": "Transferred to profit or loss",
        "values": [
          36.0,
          36.0,
          null,
          null
        ],
        "displays": [
          "36",
          "36",
          "–",
          "–"
        ],
        "sourcePage": 4113,
        "sourceLine": 37,
        "sourceLineSha256": "057ec77247c4ead00bf69f1f568cf47af6a503dbd84dfeb49750ed5c3c1fb6c7",
        "id": "fx_reclassified"
      },
      {
        "label": "Exchange differences on translating foreign operations, before tax",
        "values": [
          -3334.0,
          -3219.0,
          null,
          -116.0
        ],
        "displays": [
          "–3,334",
          "–3,219",
          "–",
          "–116"
        ],
        "sourcePage": 4113,
        "sourceLine": 38,
        "sourceLineSha256": "bec216d215080720386fe5384c52b0d4be8e4ac532537338aaca2b3fa6da5c43",
        "id": "fx_before"
      },
      {
        "label": "Deferred taxes relating to exchange differences on translating foreign operations",
        "values": [
          1.0,
          0.0,
          null,
          1.0
        ],
        "displays": [
          "1",
          "0",
          "–",
          "1"
        ],
        "sourcePage": 4113,
        "sourceLine": 39,
        "sourceLineSha256": "20e0e0d011ff0c5f462ec8741eeec6b49da7a6d50e51c74b97a46a1517abe7c4",
        "id": "fx_tax"
      },
      {
        "label": "Exchange differences on translating foreign operations, net of tax",
        "values": [
          -3333.0,
          -3219.0,
          null,
          -115.0
        ],
        "displays": [
          "–3,333",
          "–3,219",
          "–",
          "–115"
        ],
        "sourcePage": 4113,
        "sourceLine": 40,
        "sourceLineSha256": "e31d47a2f4b4bbc1f45dc951445bb523812f09105c4323bcf931497534d78efd",
        "id": "fx_net"
      },
      {
        "label": "Fair value changes recognized in other comprehensive income (OCI I)",
        "values": [
          3619.0,
          2958.0,
          null,
          661.0
        ],
        "displays": [
          "3,619",
          "2,958",
          "–",
          "661"
        ],
        "sourcePage": 4113,
        "sourceLine": 42,
        "sourceLineSha256": "820d76e233b0594d0e530751862eee068685f17ff064bd469bfcf485e7ecab6c",
        "id": "hedge1_fair"
      },
      {
        "label": "Transferred to profit or loss or inventories (OCI I)",
        "values": [
          -1384.0,
          -1165.0,
          null,
          -218.0
        ],
        "displays": [
          "–1,384",
          "–1,165",
          "–",
          "–218"
        ],
        "sourcePage": 4113,
        "sourceLine": 43,
        "sourceLineSha256": "3fa222abf7751bb66fb48f6943dac128e17d5567ad46d263fc801647b6473763",
        "id": "hedge1_transfer"
      },
      {
        "label": "Cash flow hedges (OCI I), before tax",
        "values": [
          2235.0,
          1793.0,
          null,
          442.0
        ],
        "displays": [
          "2,235",
          "1,793",
          "–",
          "442"
        ],
        "sourcePage": 4113,
        "sourceLine": 44,
        "sourceLineSha256": "6e9a22d426abfb3874ff4b1d19f4d9fd8446aee466cca76660e70c5543ff8290",
        "id": "hedge1_before"
      },
      {
        "label": "Deferred taxes relating to cash flow hedges (OCI I)",
        "values": [
          -617.0,
          -493.0,
          null,
          -124.0
        ],
        "displays": [
          "–617",
          "–493",
          "–",
          "–124"
        ],
        "sourcePage": 4113,
        "sourceLine": 45,
        "sourceLineSha256": "3665e3da6e23e38e78887dfe842acfd57384f3197f9e91510a6392fdad81ec8f",
        "id": "hedge1_tax"
      },
      {
        "label": "Cash flow hedges (OCI I), net of tax",
        "values": [
          1619.0,
          1300.0,
          null,
          318.0
        ],
        "displays": [
          "1,619",
          "1,300",
          "–",
          "318"
        ],
        "sourcePage": 4113,
        "sourceLine": 46,
        "sourceLineSha256": "fdb9cb7a097ec0f20788e7274d8c3f08056f1a514fc038d2b00157c47ecd706e",
        "id": "hedge1_net"
      },
      {
        "label": "Fair value changes recognized in other comprehensive income (OCI II)",
        "values": [
          -475.0,
          -379.0,
          null,
          -96.0
        ],
        "displays": [
          "–475",
          "–379",
          "–",
          "–96"
        ],
        "sourcePage": 4113,
        "sourceLine": 47,
        "sourceLineSha256": "a00596e54a37dc8e8e54bb505714c752e6ddb4725c4dd7f3b7ceaa9679fcae6a",
        "id": "hedge2_fair"
      },
      {
        "label": "Transferred to profit or loss or inventories (OCI II)",
        "values": [
          761.0,
          669.0,
          null,
          92.0
        ],
        "displays": [
          "761",
          "669",
          "–",
          "92"
        ],
        "sourcePage": 4113,
        "sourceLine": 48,
        "sourceLineSha256": "b08a80b178138aa892cf32133c5a66ed18d04f0176eabd280cfa229161e8c6a2",
        "id": "hedge2_transfer"
      },
      {
        "label": "Cash flow hedges (OCI II), before tax",
        "values": [
          286.0,
          290.0,
          null,
          -4.0
        ],
        "displays": [
          "286",
          "290",
          "–",
          "–4"
        ],
        "sourcePage": 4113,
        "sourceLine": 49,
        "sourceLineSha256": "b9dba0c978c10655687a03c63eca5423974c85cb05b0e8387270b40b3be18989",
        "id": "hedge2_before"
      },
      {
        "label": "Deferred taxes relating to cash flow hedges (OCI II)",
        "values": [
          -90.0,
          -89.0,
          null,
          -1.0
        ],
        "displays": [
          "–90",
          "–89",
          "–",
          "–1"
        ],
        "sourcePage": 4113,
        "sourceLine": 50,
        "sourceLineSha256": "77f75848eb625ac27032b7415a755fc6d2e4ac269ce7793c36a3575e6347ac35",
        "id": "hedge2_tax"
      },
      {
        "label": "Cash flow hedges (OCI II), net of tax",
        "values": [
          197.0,
          201.0,
          null,
          -5.0
        ],
        "displays": [
          "197",
          "201",
          "–",
          "–5"
        ],
        "sourcePage": 4113,
        "sourceLine": 51,
        "sourceLineSha256": "92832743c9d4a8b81d9887b1560d3f4a99bd00337c44f11da86bbb12db81b1f3",
        "id": "hedge2_net"
      },
      {
        "label": "Fair value changes recognized in other comprehensive income",
        "values": [
          68.0,
          68.0,
          null,
          null
        ],
        "displays": [
          "68",
          "68",
          "–",
          "–"
        ],
        "sourcePage": 4113,
        "sourceLine": 53,
        "sourceLineSha256": "f20febd70e48f6e3b6e90370f1582dea5374e3d9acd651c80bba473217279164",
        "id": "debt_fair"
      },
      {
        "label": "Transferred to profit or loss",
        "values": [
          -9.0,
          -9.0,
          null,
          null
        ],
        "displays": [
          "–9",
          "–9",
          "–",
          "–"
        ],
        "sourcePage": 4113,
        "sourceLine": 54,
        "sourceLineSha256": "3eabe3fdcadc90af1b00f96d1e867a634ee58f3eea9397c562148fdac87f3c03",
        "id": "debt_transfer"
      },
      {
        "label": "Fair value valuation of debt instruments that may be reclassified to profit or loss, before tax",
        "values": [
          59.0,
          59.0,
          null,
          null
        ],
        "displays": [
          "59",
          "59",
          "–",
          "–"
        ],
        "sourcePage": 4113,
        "sourceLine": 56,
        "sourceLineSha256": "3609cf96d32a2fc3104bab59d4e0c05db51a7aa041bee348097bd60056c4feb5",
        "id": "debt_before"
      },
      {
        "label": "Deferred taxes relating to fair value valuation of debt instruments recognized in other comprehensive income",
        "values": [
          -19.0,
          -19.0,
          null,
          null
        ],
        "displays": [
          "–19",
          "–19",
          "–",
          "–"
        ],
        "sourcePage": 4113,
        "sourceLine": 58,
        "sourceLineSha256": "8dc3dab33e3ef15006c8a2b3eeb8dcfe6bfbd8294a288697f3c92072897b9500",
        "id": "debt_tax"
      },
      {
        "label": "Fair value valuation of debt instruments that may be reclassified to profit or loss, net of tax",
        "values": [
          40.0,
          40.0,
          null,
          null
        ],
        "displays": [
          "40",
          "40",
          "–",
          "–"
        ],
        "sourcePage": 4113,
        "sourceLine": 60,
        "sourceLineSha256": "7c5f5136cc3d00592e19a677d17de64e295cada983b0c47f1657b8e7d8a7d9de",
        "id": "debt_net"
      },
      {
        "label": "Share of other comprehensive income of equity-accounted investments that may be reclassified to profit or loss, net of tax",
        "values": [
          -172.0,
          -156.0,
          null,
          -16.0
        ],
        "displays": [
          "–172",
          "–156",
          "–",
          "–16"
        ],
        "sourcePage": 4113,
        "sourceLine": 62,
        "sourceLineSha256": "bd76b24f2ca73c74472547ef785ccd82569e600aa11eb87829b711ef91a90ef3",
        "id": "associate_reclass"
      },
      {
        "label": "Items that may be reclassified to profit or loss",
        "values": [
          -1650.0,
          -1833.0,
          null,
          183.0
        ],
        "displays": [
          "–1,650",
          "–1,833",
          "–",
          "183"
        ],
        "sourcePage": 4113,
        "sourceLine": 63,
        "sourceLineSha256": "8f0082ccde06056bcd398cd538386739bea225d61d36278f1ad5129b379fa8d4",
        "id": "reclass"
      },
      {
        "label": "Other comprehensive income, before tax",
        "values": [
          5292.0,
          4706.0,
          null,
          586.0
        ],
        "displays": [
          "5,292",
          "4,706",
          "–",
          "586"
        ],
        "sourcePage": 4113,
        "sourceLine": 64,
        "sourceLineSha256": "8e46c1c23739e5a59432aa92d10de913fc6e6b8aed4eb8f183400e2e85530be6",
        "id": "oci_before"
      },
      {
        "label": "Deferred taxes relating to other comprehensive income",
        "values": [
          -2393.0,
          -2214.0,
          null,
          -178.0
        ],
        "displays": [
          "–2,393",
          "–2,214",
          "–",
          "–178"
        ],
        "sourcePage": 4113,
        "sourceLine": 65,
        "sourceLineSha256": "45608e7119a73d07160862b2647dda75a3813db9dfc481391dbe19715499d21d",
        "id": "oci_tax"
      },
      {
        "label": "Other comprehensive income, net of tax",
        "values": [
          2900.0,
          2492.0,
          null,
          408.0
        ],
        "displays": [
          "2,900",
          "2,492",
          "–",
          "408"
        ],
        "sourcePage": 4113,
        "sourceLine": 66,
        "sourceLineSha256": "3ebe9ecf79a2bdf23c1a8352db3130f1684c2671a3d44bc5d9413122fe9015dc",
        "id": "oci"
      },
      {
        "label": "Total comprehensive income",
        "values": [
          9804.0,
          9165.0,
          650.0,
          -11.0
        ],
        "displays": [
          "9,804",
          "9,165",
          "650",
          "–11"
        ],
        "sourcePage": 4113,
        "sourceLine": 67,
        "sourceLineSha256": "3bf456eda1e1031cf8a00611bfd17000deb13a22f40804e6dbdd99dab4cf21e8",
        "id": "total"
      }
    ]
  },
  "oci_2024": {
    "columns": [
      "total",
      "shareholders",
      "hybrid",
      "nci"
    ],
    "rows": [
      {
        "label": "Earnings after tax",
        "values": [
          12394.0,
          10721.0,
          630.0,
          1043.0
        ],
        "displays": [
          "12,394",
          "10,721",
          "630",
          "1,043"
        ],
        "sourcePage": 4114,
        "sourceLine": 15,
        "sourceLineSha256": "8a7d019a4710553189aa489db068fd56018e49402b573f069b338bb1fb8ad517",
        "id": "profit"
      },
      {
        "label": "Pension plan remeasurements recognized in other comprehensive income, before tax",
        "values": [
          2158.0,
          2086.0,
          null,
          72.0
        ],
        "displays": [
          "2,158",
          "2,086",
          "–",
          "72"
        ],
        "sourcePage": 4114,
        "sourceLine": 18,
        "sourceLineSha256": "d83ba75aded821eede6c80e6c8aa69ce0d8ed552af4611c57657c092101ec907",
        "id": "pension_before"
      },
      {
        "label": "Deferred taxes relating to pension plan remeasurements recognized in other comprehensive income",
        "values": [
          -514.0,
          -497.0,
          null,
          -17.0
        ],
        "displays": [
          "–514",
          "–497",
          "–",
          "–17"
        ],
        "sourcePage": 4114,
        "sourceLine": 20,
        "sourceLineSha256": "3e8311dc3ff11163df96c1e799159d1420bcd911e7ec960e14b99b0a80f7e341",
        "id": "pension_tax"
      },
      {
        "label": "Pension plan remeasurements recognized in other comprehensive income, net of tax",
        "values": [
          1644.0,
          1589.0,
          null,
          55.0
        ],
        "displays": [
          "1,644",
          "1,589",
          "–",
          "55"
        ],
        "sourcePage": 4114,
        "sourceLine": 21,
        "sourceLineSha256": "b1e855973f6b2f59716ff4e4300c957931821285e9465dc2e4a87ffa153bc0be",
        "id": "pension_net"
      },
      {
        "label": "Fair value valuation of equity instruments that will not be reclassified to profit or loss, before tax",
        "values": [
          -20.0,
          -18.0,
          null,
          -3.0
        ],
        "displays": [
          "–20",
          "–18",
          "–",
          "–3"
        ],
        "sourcePage": 4114,
        "sourceLine": 25,
        "sourceLineSha256": "b6389768c393f7ee68e51331d4ba73623ae53b0fdf1d727b724d121085d4771a",
        "id": "equity_before"
      },
      {
        "label": "Deferred taxes relating to fair value valuation of equity instruments that will not be reclassified to profit or loss",
        "values": [
          29.0,
          28.0,
          null,
          1.0
        ],
        "displays": [
          "29",
          "28",
          "–",
          "1"
        ],
        "sourcePage": 4114,
        "sourceLine": 27,
        "sourceLineSha256": "fd1dd33655a1c58c7fab3bef370d119a272bf567f885c53487f227b24d419beb",
        "id": "equity_tax"
      },
      {
        "label": "Fair Value valuation of equity instruments that will not be reclassified to profit or loss, net of tax",
        "values": [
          8.0,
          11.0,
          null,
          -2.0
        ],
        "displays": [
          "8",
          "11",
          "–",
          "–2"
        ],
        "sourcePage": 4114,
        "sourceLine": 29,
        "sourceLineSha256": "ac746b10be437f85af741c6d22a92f0a5473a6b3378693a274f210714e8c8b86",
        "id": "equity_net"
      },
      {
        "label": "Share of other comprehensive income of equity-accounted investments that will not be reclassified to profit or loss, net of tax",
        "values": [
          -60.0,
          -60.0,
          null,
          0.0
        ],
        "displays": [
          "–60",
          "–60",
          "–",
          "0"
        ],
        "sourcePage": 4114,
        "sourceLine": 31,
        "sourceLineSha256": "4897557ed56f641526c152d88e93de18ffd30ddb5824ac9ce30b10ad2c7e01e2",
        "id": "associate_nonreclass"
      },
      {
        "label": "Items that will not be reclassified to profit or loss",
        "values": [
          1592.0,
          1540.0,
          null,
          52.0
        ],
        "displays": [
          "1,592",
          "1,540",
          "–",
          "52"
        ],
        "sourcePage": 4114,
        "sourceLine": 32,
        "sourceLineSha256": "b1a1f2d5ae10e0a10e963d981b649b5946d8fef6ace12791f6c1b0073d1a23f2",
        "id": "nonreclass"
      },
      {
        "label": "Gains/losses on currency translation recognized in other comprehensive income",
        "values": [
          893.0,
          988.0,
          null,
          -96.0
        ],
        "displays": [
          "893",
          "988",
          "–",
          "–96"
        ],
        "sourcePage": 4114,
        "sourceLine": 34,
        "sourceLineSha256": "5d558dab1534f926086ccab698b9b5b8f37f6499491388848a436d0ad98c645d",
        "id": "fx_gains"
      },
      {
        "label": "Transferred to profit or loss",
        "values": [
          286.0,
          286.0,
          null,
          null
        ],
        "displays": [
          "286",
          "286",
          "–",
          "–"
        ],
        "sourcePage": 4114,
        "sourceLine": 35,
        "sourceLineSha256": "a3409f2ebd6e8d2d0c05c8253392fd9bafa186a4701645257f3eddcd621b6f51",
        "id": "fx_reclassified"
      },
      {
        "label": "Exchange differences on translating foreign operations, before tax",
        "values": [
          1179.0,
          1275.0,
          null,
          -96.0
        ],
        "displays": [
          "1,179",
          "1,275",
          "–",
          "–96"
        ],
        "sourcePage": 4114,
        "sourceLine": 36,
        "sourceLineSha256": "9b353ed56805420f7838bef20c09eec56980f4bba684d421a529c08ac0bcbf26",
        "id": "fx_before"
      },
      {
        "label": "Deferred taxes relating to exchange differences on translating foreign operations",
        "values": [
          1.0,
          1.0,
          null,
          0.0
        ],
        "displays": [
          "1",
          "1",
          "–",
          "0"
        ],
        "sourcePage": 4114,
        "sourceLine": 37,
        "sourceLineSha256": "756701ad18f1062e26548b0b9431b9ba95dc88b0a8290debc9582a3c205c5d3d",
        "id": "fx_tax"
      },
      {
        "label": "Exchange differences on translating foreign operations, net of tax",
        "values": [
          1180.0,
          1275.0,
          null,
          -96.0
        ],
        "displays": [
          "1,180",
          "1,275",
          "–",
          "–96"
        ],
        "sourcePage": 4114,
        "sourceLine": 38,
        "sourceLineSha256": "29f4f342373d9a24393338ab7a31cecf00d6ec47cf381ae90b0f99115d362188",
        "id": "fx_net"
      },
      {
        "label": "Fair value changes recognized in other comprehensive income (OCI I)",
        "values": [
          -622.0,
          -453.0,
          null,
          -169.0
        ],
        "displays": [
          "–622",
          "–453",
          "–",
          "–169"
        ],
        "sourcePage": 4114,
        "sourceLine": 40,
        "sourceLineSha256": "83dea0c583dcb5fee98e99a529774d03320e39750a9e613eff8f6469d43186ad",
        "id": "hedge1_fair"
      },
      {
        "label": "Transferred to profit or loss or inventories (OCI I)",
        "values": [
          -1072.0,
          -957.0,
          null,
          -114.0
        ],
        "displays": [
          "–1,072",
          "–957",
          "–",
          "–114"
        ],
        "sourcePage": 4114,
        "sourceLine": 41,
        "sourceLineSha256": "9fbd7f951b4d4dfe71a46af0d3ae55a615be5151ab76b2226354ecc78952bcd1",
        "id": "hedge1_transfer"
      },
      {
        "label": "Cash flow hedges (OCI I), before tax",
        "values": [
          -1694.0,
          -1410.0,
          null,
          -284.0
        ],
        "displays": [
          "–1,694",
          "–1,410",
          "–",
          "–284"
        ],
        "sourcePage": 4114,
        "sourceLine": 42,
        "sourceLineSha256": "ffa0732179b0da9606e7725227b3036fc0cf83508cc1344e42e78d4f59e73ee4",
        "id": "hedge1_before"
      },
      {
        "label": "Deferred taxes relating to cash flow hedges (OCI I)",
        "values": [
          490.0,
          404.0,
          null,
          85.0
        ],
        "displays": [
          "490",
          "404",
          "–",
          "85"
        ],
        "sourcePage": 4114,
        "sourceLine": 43,
        "sourceLineSha256": "6692ea655d17ae2ced537c4df917de9bafeb87e4e08cfe9fd4ae8124afb6ecc0",
        "id": "hedge1_tax"
      },
      {
        "label": "Cash flow hedges (OCI I), net of tax",
        "values": [
          -1204.0,
          -1006.0,
          null,
          -198.0
        ],
        "displays": [
          "–1,204",
          "–1,006",
          "–",
          "–198"
        ],
        "sourcePage": 4114,
        "sourceLine": 44,
        "sourceLineSha256": "93b0b0dc17dcaf00afdb2c80bef2408ca9c39ebae6f18305b0140a6dba88b707",
        "id": "hedge1_net"
      },
      {
        "label": "Fair value changes recognized in other comprehensive income (OCI II)",
        "values": [
          -471.0,
          -420.0,
          null,
          -51.0
        ],
        "displays": [
          "–471",
          "–420",
          "–",
          "–51"
        ],
        "sourcePage": 4114,
        "sourceLine": 45,
        "sourceLineSha256": "86116088242845eb4e554a6a94b0c97c84b12ee33c21dc8d6f96e10576da80ec",
        "id": "hedge2_fair"
      },
      {
        "label": "Transferred to profit or loss or inventories (OCI II)",
        "values": [
          1121.0,
          990.0,
          null,
          131.0
        ],
        "displays": [
          "1,121",
          "990",
          "–",
          "131"
        ],
        "sourcePage": 4114,
        "sourceLine": 46,
        "sourceLineSha256": "b1d5ca4175f5eb923ef773e1959861a1a48222942ccbc0a5233b10fc242faf13",
        "id": "hedge2_transfer"
      },
      {
        "label": "Cash flow hedges (OCI II), before tax",
        "values": [
          650.0,
          569.0,
          null,
          81.0
        ],
        "displays": [
          "650",
          "569",
          "–",
          "81"
        ],
        "sourcePage": 4114,
        "sourceLine": 47,
        "sourceLineSha256": "b5c96758f3cd24de8e37de39da9622926dfcc10b6fb04122bef1980b867a7aad",
        "id": "hedge2_before"
      },
      {
        "label": "Deferred taxes relating to cash flow hedges (OCI II)",
        "values": [
          -185.0,
          -161.0,
          null,
          -24.0
        ],
        "displays": [
          "–185",
          "–161",
          "–",
          "–24"
        ],
        "sourcePage": 4114,
        "sourceLine": 48,
        "sourceLineSha256": "bdf1a48c7188b9d5c0d4931fd7b5c4ffe62aa3fbef6addd6e23f38d7f6432d8c",
        "id": "hedge2_tax"
      },
      {
        "label": "Cash flow hedges (OCI II), net of tax",
        "values": [
          465.0,
          409.0,
          null,
          56.0
        ],
        "displays": [
          "465",
          "409",
          "–",
          "56"
        ],
        "sourcePage": 4114,
        "sourceLine": 49,
        "sourceLineSha256": "f37d16ea1ceda65740f4085b1f155d37a2cc6b7c29a32b1e2dacbbda5a5227c1",
        "id": "hedge2_net"
      },
      {
        "label": "Fair value changes recognized in other comprehensive income",
        "values": [
          80.0,
          80.0,
          null,
          null
        ],
        "displays": [
          "80",
          "80",
          "–",
          "–"
        ],
        "sourcePage": 4114,
        "sourceLine": 51,
        "sourceLineSha256": "0878ded56143c6c69d0185cca7244c6170a7243df31642a50b5da76e5fb4b681",
        "id": "debt_fair"
      },
      {
        "label": "Transferred to profit or loss",
        "values": [
          -7.0,
          -7.0,
          null,
          null
        ],
        "displays": [
          "–7",
          "–7",
          "–",
          "–"
        ],
        "sourcePage": 4114,
        "sourceLine": 52,
        "sourceLineSha256": "ed6eff9a3d8b7e71121f40dccfba63d152739edfff23c9ed39b5c60160ea72a1",
        "id": "debt_transfer"
      },
      {
        "label": "Fair value valuation of debt instruments that may be reclassified to profit or loss, before tax",
        "values": [
          73.0,
          73.0,
          null,
          null
        ],
        "displays": [
          "73",
          "73",
          "–",
          "–"
        ],
        "sourcePage": 4114,
        "sourceLine": 54,
        "sourceLineSha256": "b400531f91ea4206f0905ca2002b43ca014a6a71e60e6401696e814f9739baeb",
        "id": "debt_before"
      },
      {
        "label": "Deferred taxes relating to fair value valuation of debt instruments recognized in other comprehensive income",
        "values": [
          -22.0,
          -22.0,
          null,
          null
        ],
        "displays": [
          "–22",
          "–22",
          "–",
          "–"
        ],
        "sourcePage": 4114,
        "sourceLine": 56,
        "sourceLineSha256": "e9558f9db3476c3e5f5b8750a4ff5ccb81f7f6d64b5c3162be27003b6dd07358",
        "id": "debt_tax"
      },
      {
        "label": "Fair value valuation of debt instruments that may be reclassified to profit or loss, net of tax",
        "values": [
          51.0,
          51.0,
          null,
          null
        ],
        "displays": [
          "51",
          "51",
          "–",
          "–"
        ],
        "sourcePage": 4114,
        "sourceLine": 58,
        "sourceLineSha256": "d24e71867d5bd7b1c3df80b8b256ed0811e3e10c8ec44ec9ada648fd40635ddf",
        "id": "debt_net"
      },
      {
        "label": "Share of other comprehensive income of equity-accounted investments that may be reclassified to profit or loss, net of tax",
        "values": [
          -113.0,
          -114.0,
          null,
          2.0
        ],
        "displays": [
          "–113",
          "–114",
          "–",
          "2"
        ],
        "sourcePage": 4114,
        "sourceLine": 60,
        "sourceLineSha256": "724d36d726b9a1a8e19f14c4e89f267974aa4b1ce46816beee85cc09fc51b1c7",
        "id": "associate_reclass"
      },
      {
        "label": "Items that may be reclassified to profit or loss",
        "values": [
          379.0,
          614.0,
          null,
          -236.0
        ],
        "displays": [
          "379",
          "614",
          "–",
          "–236"
        ],
        "sourcePage": 4114,
        "sourceLine": 61,
        "sourceLineSha256": "64efb13a05bc0d498c7a39341e274a49f53e8b9da0b19ffbebc04308eb945841",
        "id": "reclass"
      },
      {
        "label": "Other comprehensive income, before tax",
        "values": [
          2173.0,
          2401.0,
          null,
          -228.0
        ],
        "displays": [
          "2,173",
          "2,401",
          "–",
          "–228"
        ],
        "sourcePage": 4114,
        "sourceLine": 62,
        "sourceLineSha256": "ef41d181c01e4f6961f71fab93e7be3712903f07654df497b03b70ea8a3f4edc",
        "id": "oci_before"
      },
      {
        "label": "Deferred taxes relating to other comprehensive income",
        "values": [
          -202.0,
          -246.0,
          null,
          45.0
        ],
        "displays": [
          "–202",
          "–246",
          "–",
          "45"
        ],
        "sourcePage": 4114,
        "sourceLine": 63,
        "sourceLineSha256": "6e527c3576083b5fc378f2e42d449a5f9d99608e5685f938e6ed4280986dfb3f",
        "id": "oci_tax"
      },
      {
        "label": "Other comprehensive income, net of tax",
        "values": [
          1971.0,
          2154.0,
          null,
          -183.0
        ],
        "displays": [
          "1,971",
          "2,154",
          "–",
          "–183"
        ],
        "sourcePage": 4114,
        "sourceLine": 64,
        "sourceLineSha256": "baea4146b6b6a8c6632e0fb25e4ecf310f9ee825cdc29d72794ef3eecf190172",
        "id": "oci"
      },
      {
        "label": "Total comprehensive income",
        "values": [
          14365.0,
          12875.0,
          630.0,
          860.0
        ],
        "displays": [
          "14,365",
          "12,875",
          "630",
          "860"
        ],
        "sourcePage": 4114,
        "sourceLine": 65,
        "sourceLineSha256": "23f9eaccd64081f99690ebe3e5d391d100c9aebd468b07a9af94af492fbb27ca",
        "id": "total"
      }
    ]
  },
  "assets": {
    "columns": [
      "2025",
      "2024"
    ],
    "rows": [
      {
        "label": "Intangible assets",
        "values": [
          91474.0,
          93333.0
        ],
        "displays": [
          "91,474",
          "93,333"
        ],
        "sourcePage": 4115,
        "sourceLine": 14,
        "sourceLineSha256": "f90bb2530d8d28288ca8c984e4d3025476cee339e1f1b35c83f89a40cc2dcd48",
        "id": "intangible"
      },
      {
        "label": "Property, plant and equipment",
        "values": [
          73076.0,
          71452.0
        ],
        "displays": [
          "73,076",
          "71,452"
        ],
        "sourcePage": 4115,
        "sourceLine": 15,
        "sourceLineSha256": "ea383e8367ee8250a88087387f764eaed0e09ebc46ab59b24ea38b2b05d9227a",
        "id": "ppe"
      },
      {
        "label": "Lease assets",
        "values": [
          82486.0,
          73193.0
        ],
        "displays": [
          "82,486",
          "73,193"
        ],
        "sourcePage": 4115,
        "sourceLine": 16,
        "sourceLineSha256": "cf0b7625ff64208077ad3a1303388826224d68d7781b4dacbe5bb2faa0db32f0",
        "id": "lease"
      },
      {
        "label": "Investment property",
        "values": [
          609.0,
          622.0
        ],
        "displays": [
          "609",
          "622"
        ],
        "sourcePage": 4115,
        "sourceLine": 17,
        "sourceLineSha256": "380b382ccd792e92496b8b1f17edcb0e2cde71080bb90d44398c1e6591c78c06",
        "id": "property"
      },
      {
        "label": "Equity-accounted investments",
        "values": [
          9996.0,
          10269.0
        ],
        "displays": [
          "9,996",
          "10,269"
        ],
        "sourcePage": 4115,
        "sourceLine": 18,
        "sourceLineSha256": "a95bc61b52959164907980c17c3b4be501e2abb88be890ca9996d4a6015ca5dd",
        "id": "equity"
      },
      {
        "label": "Other equity investments",
        "values": [
          7366.0,
          5731.0
        ],
        "displays": [
          "7,366",
          "5,731"
        ],
        "sourcePage": 4115,
        "sourceLine": 19,
        "sourceLineSha256": "f70667a1c32f632fbce475f4a82804f4982822ad76db87d79ee31f55e47149c7",
        "id": "other_equity"
      },
      {
        "label": "Financial services receivables",
        "values": [
          101230.0,
          101087.0
        ],
        "displays": [
          "101,230",
          "101,087"
        ],
        "sourcePage": 4115,
        "sourceLine": 20,
        "sourceLineSha256": "da98bd58c2042c2bd991bd04f699e2cc86556c58f4a2e805fd9006d70af9b463",
        "id": "fs_noncurrent"
      },
      {
        "label": "Other financial assets",
        "values": [
          11692.0,
          12129.0
        ],
        "displays": [
          "11,692",
          "12,129"
        ],
        "sourcePage": 4115,
        "sourceLine": 21,
        "sourceLineSha256": "177c381d079c129a17ba74091d72db028f85589c2537f0f65713d669d0f1a2a5",
        "id": "financial_noncurrent"
      },
      {
        "label": "Other receivables",
        "values": [
          3651.0,
          2868.0
        ],
        "displays": [
          "3,651",
          "2,868"
        ],
        "sourcePage": 4115,
        "sourceLine": 22,
        "sourceLineSha256": "75f0de5955f73f58feff6011122c313dff4fc806d70145345d0a2d57b2161ff7",
        "id": "other_noncurrent"
      },
      {
        "label": "Tax receivables",
        "values": [
          411.0,
          409.0
        ],
        "displays": [
          "411",
          "409"
        ],
        "sourcePage": 4115,
        "sourceLine": 23,
        "sourceLineSha256": "accb6a10d074b27d4a0571b18655d772bfa6dbff9daa3fedd208ab8e8958ac08",
        "id": "tax_noncurrent"
      },
      {
        "label": "Deferred tax assets",
        "values": [
          14611.0,
          16581.0
        ],
        "displays": [
          "14,611",
          "16,581"
        ],
        "sourcePage": 4115,
        "sourceLine": 24,
        "sourceLineSha256": "87c8a1c567b791a7cb21ac2d46d43ee4f188e18777d5016198db3d5edbda83d5",
        "id": "dta"
      },
      {
        "label": "Non-current assets",
        "values": [
          396602.0,
          387674.0
        ],
        "displays": [
          "396,602",
          "387,674"
        ],
        "sourcePage": 4115,
        "sourceLine": 25,
        "sourceLineSha256": "dd31e7637b8ad728039c3b468c6a494fcdbdec7daf83ae0b6efa3df226afbfab",
        "id": "noncurrent",
        "sourceLabel": "",
        "context": "Unlabeled reported subtotal; the label repeats its exact source section heading."
      },
      {
        "label": "Inventories",
        "values": [
          56042.0,
          56720.0
        ],
        "displays": [
          "56,042",
          "56,720"
        ],
        "sourcePage": 4115,
        "sourceLine": 27,
        "sourceLineSha256": "fd0287bec7342b92ef51fa7f757bf1a6934d269ef4908b1937d9abb00a5c2500",
        "id": "inventory"
      },
      {
        "label": "Trade receivables",
        "values": [
          20760.0,
          21130.0
        ],
        "displays": [
          "20,760",
          "21,130"
        ],
        "sourcePage": 4115,
        "sourceLine": 28,
        "sourceLineSha256": "b3ad55edde05c8bd0bdb8614860ca80cd036934f4dccb51bc998822ccb0e2037",
        "id": "trade"
      },
      {
        "label": "Financial services receivables",
        "values": [
          70026.0,
          68855.0
        ],
        "displays": [
          "70,026",
          "68,855"
        ],
        "sourcePage": 4115,
        "sourceLine": 29,
        "sourceLineSha256": "7b5c522c241361c31b1309876e51d8a653e75afda4bca550ba406419e20834c5",
        "id": "fs_current"
      },
      {
        "label": "Other financial assets",
        "values": [
          20158.0,
          18649.0
        ],
        "displays": [
          "20,158",
          "18,649"
        ],
        "sourcePage": 4115,
        "sourceLine": 30,
        "sourceLineSha256": "89726ad733fca465f11ce0eba75ea708f76cae895c9c4ce328245bd755b8a92f",
        "id": "financial_current"
      },
      {
        "label": "Other receivables",
        "values": [
          9881.0,
          10217.0
        ],
        "displays": [
          "9,881",
          "10,217"
        ],
        "sourcePage": 4115,
        "sourceLine": 31,
        "sourceLineSha256": "b33c64d9835b444247ab7f142b9f75e30d48c18ae4403ad65e0cbbfdcd2e3743",
        "id": "other_current"
      },
      {
        "label": "Tax receivables",
        "values": [
          2674.0,
          2038.0
        ],
        "displays": [
          "2,674",
          "2,038"
        ],
        "sourcePage": 4115,
        "sourceLine": 32,
        "sourceLineSha256": "e5d600d72d89e79e0672170a9da98ac0d25f41b6f0a8d90a82ea52ac5ce99cb4",
        "id": "tax_current"
      },
      {
        "label": "Marketable securities and time deposits",
        "values": [
          29522.0,
          27326.0
        ],
        "displays": [
          "29,522",
          "27,326"
        ],
        "sourcePage": 4115,
        "sourceLine": 33,
        "sourceLineSha256": "c300268530979bd3399e4251d8e11b050123221cb5cb6db1892cdc01e6156447",
        "id": "securities"
      },
      {
        "label": "Cash and cash equivalents",
        "values": [
          38801.0,
          40296.0
        ],
        "displays": [
          "38,801",
          "40,296"
        ],
        "sourcePage": 4115,
        "sourceLine": 34,
        "sourceLineSha256": "41ffee5a9cba410e55b7567087174c285a019baad797aed832b2e98a1fa1f214",
        "id": "cash"
      },
      {
        "label": "Current assets",
        "values": [
          247865.0,
          245231.0
        ],
        "displays": [
          "247,865",
          "245,231"
        ],
        "sourcePage": 4115,
        "sourceLine": 35,
        "sourceLineSha256": "885a7d79af23b42710dd70fd84c164112ff773e51b739e2fdf35f3cb0f43a5fe",
        "id": "current",
        "sourceLabel": "",
        "context": "Unlabeled reported subtotal; the label repeats its exact source section heading."
      },
      {
        "label": "Total assets",
        "values": [
          644467.0,
          632905.0
        ],
        "displays": [
          "644,467",
          "632,905"
        ],
        "sourcePage": 4115,
        "sourceLine": 36,
        "sourceLineSha256": "8961f2bffc5677bcccb0b7d09cce8c0eadae27d41696224bc8a5acd154c71710",
        "id": "total"
      }
    ]
  },
  "liabilities": {
    "columns": [
      "2025",
      "2024"
    ],
    "rows": [
      {
        "label": "Subscribed capital",
        "values": [
          1283.0,
          1283.0
        ],
        "displays": [
          "1,283",
          "1,283"
        ],
        "sourcePage": 4116,
        "sourceLine": 10,
        "sourceLineSha256": "184c57f261765016002b794e1117f93406bbc29ae03e492252708c59676ff808",
        "id": "subscribed"
      },
      {
        "label": "Capital reserve",
        "values": [
          14551.0,
          14551.0
        ],
        "displays": [
          "14,551",
          "14,551"
        ],
        "sourcePage": 4116,
        "sourceLine": 11,
        "sourceLineSha256": "1550f0851a9f0cb725e8131cf20d2f8cda895b2d61228f4b91edc955a1bf58d9",
        "id": "capital"
      },
      {
        "label": "Retained earnings",
        "values": [
          161357.0,
          155130.0
        ],
        "displays": [
          "161,357",
          "155,130"
        ],
        "sourcePage": 4116,
        "sourceLine": 12,
        "sourceLineSha256": "c49c012eeeb3693e4ed2c785860c6660d64641396caef269e6f46d9fb60a23fb",
        "id": "retained"
      },
      {
        "label": "Other reserves",
        "values": [
          -3190.0,
          -2560.0
        ],
        "displays": [
          "–3,190",
          "–2,560"
        ],
        "sourcePage": 4116,
        "sourceLine": 13,
        "sourceLineSha256": "a06d1474caa35abdcc1975aa0f80d20c529039a463e0c5e4a1191f3391947554",
        "id": "reserves"
      },
      {
        "label": "Equity attributable to Volkswagen AG hybrid capital investors",
        "values": [
          14275.0,
          13890.0
        ],
        "displays": [
          "14,275",
          "13,890"
        ],
        "sourcePage": 4116,
        "sourceLine": 14,
        "sourceLineSha256": "8aff3741abdf0fcc3d7ea9f19885083d2795efacde0e85d44bfd8ab1db3ea853",
        "id": "hybrid"
      },
      {
        "label": "Equity attributable to Volkswagen AG shareholders and hybrid capital investors",
        "values": [
          188277.0,
          182294.0
        ],
        "displays": [
          "188,277",
          "182,294"
        ],
        "sourcePage": 4116,
        "sourceLine": 15,
        "sourceLineSha256": "48de3bb87036914d81ac3677cebc4d6172a001ac0307f2c76949138e1c489a2a",
        "id": "parent_equity"
      },
      {
        "label": "Non-controlling interests",
        "values": [
          14777.0,
          14437.0
        ],
        "displays": [
          "14,777",
          "14,437"
        ],
        "sourcePage": 4116,
        "sourceLine": 16,
        "sourceLineSha256": "604951d4665b5c8690d76ef0b2433a92a8b565a5354a9c6e25162a81d9fd21da",
        "id": "nci"
      },
      {
        "label": "Equity",
        "values": [
          203054.0,
          196731.0
        ],
        "displays": [
          "203,054",
          "196,731"
        ],
        "sourcePage": 4116,
        "sourceLine": 17,
        "sourceLineSha256": "1f31a2c1f964842a6e7ac4a5b77244b645cf35d19df4295447252b063ba4a8ff",
        "id": "equity",
        "sourceLabel": "",
        "context": "Unlabeled reported subtotal; the label repeats its exact source section heading."
      },
      {
        "label": "Financial liabilities",
        "values": [
          137214.0,
          137061.0
        ],
        "displays": [
          "137,214",
          "137,061"
        ],
        "sourcePage": 4116,
        "sourceLine": 19,
        "sourceLineSha256": "8e6da17510cdc036b5fa70a78f1089e6a0452bf6e7221e2dc70c072aaedd59a8",
        "id": "financial_nc"
      },
      {
        "label": "Other financial liabilities",
        "values": [
          6422.0,
          6548.0
        ],
        "displays": [
          "6,422",
          "6,548"
        ],
        "sourcePage": 4116,
        "sourceLine": 20,
        "sourceLineSha256": "d352881f96db4bb759a1eb340fc78840ecfc88062f20e4e8fc20575bfee41b8b",
        "id": "other_financial_nc"
      },
      {
        "label": "Other liabilities",
        "values": [
          11420.0,
          10584.0
        ],
        "displays": [
          "11,420",
          "10,584"
        ],
        "sourcePage": 4116,
        "sourceLine": 21,
        "sourceLineSha256": "4dcf435016d35a6a2a28f0b912f93dd106e88b7278d874e84d8c21184f0e7cd4",
        "id": "other_nc"
      },
      {
        "label": "Deferred tax liabilities",
        "values": [
          9963.0,
          10900.0
        ],
        "displays": [
          "9,963",
          "10,900"
        ],
        "sourcePage": 4116,
        "sourceLine": 22,
        "sourceLineSha256": "ccdc49b5437b6d685fba184e4c1f19ac33255f45a0ec2285ec5435039c6f97f7",
        "id": "dtl"
      },
      {
        "label": "Provisions for pensions",
        "values": [
          22826.0,
          27602.0
        ],
        "displays": [
          "22,826",
          "27,602"
        ],
        "sourcePage": 4116,
        "sourceLine": 23,
        "sourceLineSha256": "358212e572dafac43a25f34c60042350e6c45a2686e2e0cd3eb34de4ea1e35e5",
        "id": "pension"
      },
      {
        "label": "Provisions for taxes",
        "values": [
          3367.0,
          4084.0
        ],
        "displays": [
          "3,367",
          "4,084"
        ],
        "sourcePage": 4116,
        "sourceLine": 24,
        "sourceLineSha256": "2d68cc15f7e76729557b1fcb429a5964a816fe5030fd4431066b86e345971c1a",
        "id": "tax_provision_nc"
      },
      {
        "label": "Other provisions",
        "values": [
          23676.0,
          22355.0
        ],
        "displays": [
          "23,676",
          "22,355"
        ],
        "sourcePage": 4116,
        "sourceLine": 25,
        "sourceLineSha256": "9d28ec911359020c540d4d7e36083f8cd3723b0f272fedc894b80e926e5557b8",
        "id": "provision_nc"
      },
      {
        "label": "Non-current liabilities",
        "values": [
          214887.0,
          219134.0
        ],
        "displays": [
          "214,887",
          "219,134"
        ],
        "sourcePage": 4116,
        "sourceLine": 26,
        "sourceLineSha256": "6e3d8978a144d89c9581c99e829ebb30aa542adb721dca9f6d150d841e4b6e80",
        "id": "noncurrent",
        "sourceLabel": "",
        "context": "Unlabeled reported subtotal; the label repeats its exact source section heading."
      },
      {
        "label": "Financial liabilities",
        "values": [
          127489.0,
          117020.0
        ],
        "displays": [
          "127,489",
          "117,020"
        ],
        "sourcePage": 4116,
        "sourceLine": 28,
        "sourceLineSha256": "322652c6548370ce46bab4e0bddbe6ef55b105052e70e5520563e27c03bd27f1",
        "id": "financial_c"
      },
      {
        "label": "Trade payables",
        "values": [
          30490.0,
          29772.0
        ],
        "displays": [
          "30,490",
          "29,772"
        ],
        "sourcePage": 4116,
        "sourceLine": 29,
        "sourceLineSha256": "6f3e0fd0dba27bb26b68be657fa54db634c517c5c9b267050c2d32ad837b08a2",
        "id": "trade"
      },
      {
        "label": "Tax payables",
        "values": [
          497.0,
          724.0
        ],
        "displays": [
          "497",
          "724"
        ],
        "sourcePage": 4116,
        "sourceLine": 30,
        "sourceLineSha256": "38db69174feac227e71b323dc9323f8253d09f9a4019617db109f39a52c1c421",
        "id": "tax"
      },
      {
        "label": "Other financial liabilities",
        "values": [
          13643.0,
          14364.0
        ],
        "displays": [
          "13,643",
          "14,364"
        ],
        "sourcePage": 4116,
        "sourceLine": 31,
        "sourceLineSha256": "808b8d82eb917da06065f42fb677875e61cc98f21a900c1728a90ec0dfae414f",
        "id": "other_financial_c"
      },
      {
        "label": "Other liabilities",
        "values": [
          24427.0,
          24752.0
        ],
        "displays": [
          "24,427",
          "24,752"
        ],
        "sourcePage": 4116,
        "sourceLine": 32,
        "sourceLineSha256": "574bb8baacc95e07d2becd38025af589fef06f568316ddaf205a3987dc75ad5a",
        "id": "other_c"
      },
      {
        "label": "Provisions for taxes",
        "values": [
          1986.0,
          1698.0
        ],
        "displays": [
          "1,986",
          "1,698"
        ],
        "sourcePage": 4116,
        "sourceLine": 33,
        "sourceLineSha256": "b9aeeda5bea84264afe8a104e223efdfbc74df42b8614d31d698178d44f2166b",
        "id": "tax_provision_c"
      },
      {
        "label": "Other provisions",
        "values": [
          27993.0,
          28709.0
        ],
        "displays": [
          "27,993",
          "28,709"
        ],
        "sourcePage": 4116,
        "sourceLine": 34,
        "sourceLineSha256": "d0da0bb2db0d6a4099705601301db186e863415475156387b4a88b48b83bad99",
        "id": "provision_c"
      },
      {
        "label": "Current liabilities",
        "values": [
          226525.0,
          217039.0
        ],
        "displays": [
          "226,525",
          "217,039"
        ],
        "sourcePage": 4116,
        "sourceLine": 35,
        "sourceLineSha256": "473091b161315d3d59d70a999464e044e80910aca12f702cf50a112917d23727",
        "id": "current",
        "sourceLabel": "",
        "context": "Unlabeled reported subtotal; the label repeats its exact source section heading."
      },
      {
        "label": "Total equity and liabilities",
        "values": [
          644467.0,
          632905.0
        ],
        "displays": [
          "644,467",
          "632,905"
        ],
        "sourcePage": 4116,
        "sourceLine": 36,
        "sourceLineSha256": "ed75b6da45604208f4223fffba7f25e4c891386be96d4d2b8b3bd6b159a27016",
        "id": "total"
      }
    ]
  },
  "equity_2024": {
    "columns": [
      "subscribed",
      "capital",
      "retained",
      "currency",
      "hedge1",
      "hedge2",
      "equity_debt",
      "equity_accounted",
      "hybrid",
      "parent_and_hybrid",
      "nci",
      "total"
    ],
    "rows": [
      {
        "label": "Balance at Jan. 1, 2024",
        "values": [
          1283.0,
          14551.0,
          147830.0,
          -3431.0,
          1472.0,
          -676.0,
          -966.0,
          476.0,
          15155.0,
          175694.0,
          14218.0,
          189912.0
        ],
        "displays": [
          "1,283",
          "14,551",
          "147,830",
          "–3,431",
          "1,472",
          "–676",
          "–966",
          "476",
          "15,155",
          "175,694",
          "14,218",
          "189,912"
        ],
        "sourcePage": 4117,
        "sourceLine": 22,
        "sourceLineSha256": "1186575069d518225b6ea544726e30525a943faf14e03fbdc3d073b121a85b49",
        "id": "unadjusted_opening"
      },
      {
        "label": "Prior-year corrections in accordance with IAS 8",
        "values": [
          null,
          null,
          -726.0,
          null,
          null,
          null,
          null,
          null,
          null,
          -726.0,
          null,
          -726.0
        ],
        "displays": [
          "–",
          "–",
          "–726",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–726",
          "–",
          "–726"
        ],
        "sourcePage": 4117,
        "sourceLine": 24,
        "sourceLineSha256": "0047a0f135a10443b412923175d94081e7a21e589520b9b9dcebf3a96aac3f5a",
        "id": "correction"
      },
      {
        "label": "Adjusted balance at Jan. 1, 2024",
        "values": [
          1283.0,
          14551.0,
          147104.0,
          -3431.0,
          1472.0,
          -676.0,
          -966.0,
          476.0,
          15155.0,
          174968.0,
          14218.0,
          189186.0
        ],
        "displays": [
          "1,283",
          "14,551",
          "147,104",
          "–3,431",
          "1,472",
          "–676",
          "–966",
          "476",
          "15,155",
          "174,968",
          "14,218",
          "189,186"
        ],
        "sourcePage": 4117,
        "sourceLine": 25,
        "sourceLineSha256": "46f4cc6da2cfbb8331285a2c6cc84c06c954c108d4e64f10d039f0c576cf3c5c",
        "id": "opening"
      },
      {
        "label": "Earnings after tax",
        "values": [
          null,
          null,
          10721.0,
          null,
          null,
          null,
          null,
          null,
          630.0,
          11351.0,
          1043.0,
          12394.0
        ],
        "displays": [
          "–",
          "–",
          "10,721",
          "–",
          "–",
          "–",
          "–",
          "–",
          "630",
          "11,351",
          "1,043",
          "12,394"
        ],
        "sourcePage": 4117,
        "sourceLine": 26,
        "sourceLineSha256": "46b1b90010b7b5e7b7de2ea577193b2d8473b02f38797977fdcd8d60ae7e76ca",
        "id": "profit"
      },
      {
        "label": "Other comprehensive income, net of tax",
        "values": [
          null,
          null,
          1589.0,
          1275.0,
          -1006.0,
          409.0,
          61.0,
          -174.0,
          null,
          2154.0,
          -183.0,
          1971.0
        ],
        "displays": [
          "–",
          "–",
          "1,589",
          "1,275",
          "–1,006",
          "409",
          "61",
          "–174",
          "–",
          "2,154",
          "–183",
          "1,971"
        ],
        "sourcePage": 4117,
        "sourceLine": 27,
        "sourceLineSha256": "1331739e674b510604ddf6d1b53c2707f8c93a1db08ab737f4f6c54d365412f9",
        "id": "oci"
      },
      {
        "label": "Total comprehensive income",
        "values": [
          null,
          null,
          12310.0,
          1275.0,
          -1006.0,
          409.0,
          61.0,
          -174.0,
          630.0,
          13505.0,
          860.0,
          14365.0
        ],
        "displays": [
          "–",
          "–",
          "12,310",
          "1,275",
          "–1,006",
          "409",
          "61",
          "–174",
          "630",
          "13,505",
          "860",
          "14,365"
        ],
        "sourcePage": 4117,
        "sourceLine": 28,
        "sourceLineSha256": "1159f7c6ee559fe13415d28236c079550e1df14c15bbfb1710beb8083b2df105",
        "id": "comprehensive"
      },
      {
        "label": "Disposal of equity instruments",
        "values": [
          null,
          null,
          1.0,
          null,
          null,
          null,
          -1.0,
          null,
          null,
          null,
          null,
          null
        ],
        "displays": [
          "–",
          "–",
          "1",
          "–",
          "–",
          "–",
          "–1",
          "–",
          "–",
          "–",
          "–",
          "–"
        ],
        "sourcePage": 4117,
        "sourceLine": 29,
        "sourceLineSha256": "a956dc8af5af7d58663c298807c3bde1c5ade52d78d411d822ce606bdae9a003",
        "id": "disposal"
      },
      {
        "label": "Capital increases/Capital decreases",
        "values": [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          -1244.0,
          -1244.0,
          106.0,
          -1138.0
        ],
        "displays": [
          "–",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–1,244",
          "–1,244",
          "106",
          "–1,138"
        ],
        "sourcePage": 4117,
        "sourceLine": 30,
        "sourceLineSha256": "c00334461e13cddb495eb84a4f9bfaafcc6d98a656ff6d2059c20a94ec7665d3",
        "id": "capital"
      },
      {
        "label": "Dividends payment",
        "values": [
          null,
          null,
          -4524.0,
          null,
          null,
          null,
          null,
          null,
          -651.0,
          -5175.0,
          -604.0,
          -5779.0
        ],
        "displays": [
          "–",
          "–",
          "–4,524",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–651",
          "–5,175",
          "–604",
          "–5,779"
        ],
        "sourcePage": 4117,
        "sourceLine": 31,
        "sourceLineSha256": "0a9c0b6d71c1fb40a17167f4d308830af7c53d690a2827cc74c0734d9b4a7f85",
        "id": "dividends"
      },
      {
        "label": "Capital transactions involving a change in ownership interest",
        "values": [
          null,
          null,
          -4.0,
          0.0,
          null,
          null,
          null,
          null,
          null,
          -4.0,
          4.0,
          null
        ],
        "displays": [
          "–",
          "–",
          "–4",
          "0",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–4",
          "4",
          "–"
        ],
        "sourcePage": 4117,
        "sourceLine": 33,
        "sourceLineSha256": "3013b544f861b5e8e8f3aa288e732fc33e350b91bd4b1fd7f22b4a27dd86f565",
        "id": "ownership"
      },
      {
        "label": "Other changes",
        "values": [
          null,
          null,
          243.0,
          null,
          null,
          null,
          null,
          1.0,
          null,
          244.0,
          -147.0,
          97.0
        ],
        "displays": [
          "–",
          "–",
          "243",
          "–",
          "–",
          "–",
          "–",
          "1",
          "–",
          "244",
          "–147",
          "97"
        ],
        "sourcePage": 4117,
        "sourceLine": 34,
        "sourceLineSha256": "b1198894fc1179f60782ace3db2f8ed8aa9459d92719197eda09f76d8cd999cc",
        "id": "other"
      },
      {
        "label": "Balance at Dec. 31, 2024",
        "values": [
          1283.0,
          14551.0,
          155130.0,
          -2156.0,
          466.0,
          -267.0,
          -906.0,
          303.0,
          13890.0,
          182294.0,
          14437.0,
          196731.0
        ],
        "displays": [
          "1,283",
          "14,551",
          "155,130",
          "–2,156",
          "466",
          "–267",
          "–906",
          "303",
          "13,890",
          "182,294",
          "14,437",
          "196,731"
        ],
        "sourcePage": 4117,
        "sourceLine": 35,
        "sourceLineSha256": "84ac116e782f24b228117ec444c03a329b63c1f79c09c643d46392fd64da3dac",
        "id": "closing"
      }
    ]
  },
  "equity_2025": {
    "columns": [
      "subscribed",
      "capital",
      "retained",
      "currency",
      "hedge1",
      "hedge2",
      "equity_debt",
      "equity_accounted",
      "hybrid",
      "parent_and_hybrid",
      "nci",
      "total"
    ],
    "rows": [
      {
        "label": "Balance at Jan. 1, 2025",
        "values": [
          1283.0,
          14551.0,
          155130.0,
          -2156.0,
          466.0,
          -267.0,
          -906.0,
          303.0,
          13890.0,
          182294.0,
          14437.0,
          196731.0
        ],
        "displays": [
          "1,283",
          "14,551",
          "155,130",
          "–2,156",
          "466",
          "–267",
          "–906",
          "303",
          "13,890",
          "182,294",
          "14,437",
          "196,731"
        ],
        "sourcePage": 4117,
        "sourceLine": 38,
        "sourceLineSha256": "900d925bc750ddabf5249d7aca0e044cf2ac9238a335d5dee09aad31e187e394",
        "id": "opening"
      },
      {
        "label": "Earnings after tax",
        "values": [
          null,
          null,
          6673.0,
          null,
          null,
          null,
          null,
          null,
          650.0,
          7323.0,
          -419.0,
          6904.0
        ],
        "displays": [
          "–",
          "–",
          "6,673",
          "–",
          "–",
          "–",
          "–",
          "–",
          "650",
          "7,323",
          "–419",
          "6,904"
        ],
        "sourcePage": 4117,
        "sourceLine": 39,
        "sourceLineSha256": "ae198663c5af39246787f0922fd17f94771593ec2410671b7b3057d21ff77e4e",
        "id": "profit"
      },
      {
        "label": "Other comprehensive income, net of tax",
        "values": [
          null,
          null,
          3216.0,
          -3219.0,
          1300.0,
          201.0,
          1154.0,
          -161.0,
          null,
          2492.0,
          408.0,
          2900.0
        ],
        "displays": [
          "–",
          "–",
          "3,216",
          "–3,219",
          "1,300",
          "201",
          "1,154",
          "–161",
          "–",
          "2,492",
          "408",
          "2,900"
        ],
        "sourcePage": 4117,
        "sourceLine": 40,
        "sourceLineSha256": "d0fccbb8cfd1793af5c7f749d7f34e3d140f516c29cfe187269d4680a2377b89",
        "id": "oci"
      },
      {
        "label": "Total comprehensive income",
        "values": [
          null,
          null,
          9888.0,
          -3219.0,
          1300.0,
          201.0,
          1154.0,
          -161.0,
          650.0,
          9815.0,
          -11.0,
          9804.0
        ],
        "displays": [
          "–",
          "–",
          "9,888",
          "–3,219",
          "1,300",
          "201",
          "1,154",
          "–161",
          "650",
          "9,815",
          "–11",
          "9,804"
        ],
        "sourcePage": 4117,
        "sourceLine": 41,
        "sourceLineSha256": "6f6922d517a25a83447e9b13436a41db19fca3383eea7efab167ba03c6d17ff9",
        "id": "comprehensive"
      },
      {
        "label": "Disposal of equity instruments",
        "values": [
          null,
          null,
          -31.0,
          null,
          null,
          null,
          31.0,
          null,
          null,
          null,
          null,
          null
        ],
        "displays": [
          "–",
          "–",
          "–31",
          "–",
          "–",
          "–",
          "31",
          "–",
          "–",
          "–",
          "–",
          "–"
        ],
        "sourcePage": 4117,
        "sourceLine": 42,
        "sourceLineSha256": "70e642f237af0c3cd74bb1115d5057dcc53a677598951e6a129671161a58ef1a",
        "id": "disposal"
      },
      {
        "label": "Capital increases/Capital decreases",
        "values": [
          null,
          null,
          0.0,
          null,
          null,
          null,
          null,
          null,
          400.0,
          400.0,
          29.0,
          428.0
        ],
        "displays": [
          "–",
          "–",
          "0",
          "–",
          "–",
          "–",
          "–",
          "–",
          "400",
          "400",
          "29",
          "428"
        ],
        "sourcePage": 4117,
        "sourceLine": 43,
        "sourceLineSha256": "0c5a8d178fa881d943f6488a53eee0a150979cda3ef35c746f13b291d9b6ba33",
        "id": "capital"
      },
      {
        "label": "Dividends payment",
        "values": [
          null,
          null,
          -3171.0,
          null,
          null,
          null,
          null,
          null,
          -664.0,
          -3835.0,
          -625.0,
          -4460.0
        ],
        "displays": [
          "–",
          "–",
          "–3,171",
          "–",
          "–",
          "–",
          "–",
          "–",
          "–664",
          "–3,835",
          "–625",
          "–4,460"
        ],
        "sourcePage": 4117,
        "sourceLine": 44,
        "sourceLineSha256": "8e097d44f5c6ac9829efb04d014a5e7b25b9274a93fdd93f5a6e1adc5adcb7b8",
        "id": "dividends"
      },
      {
        "label": "Capital transactions involving a change in ownership interest",
        "values": [
          null,
          null,
          -430.0,
          48.0,
          0.0,
          0.0,
          14.0,
          0.0,
          null,
          -367.0,
          719.0,
          352.0
        ],
        "displays": [
          "–",
          "–",
          "–430",
          "48",
          "0",
          "0",
          "14",
          "0",
          "–",
          "–367",
          "719",
          "352"
        ],
        "sourcePage": 4117,
        "sourceLine": 46,
        "sourceLineSha256": "0b1d1f75d63be7bae6826ed5ba607978a98cea0fb79bd0cf0e01debb4fe4dbf0",
        "id": "ownership"
      },
      {
        "label": "Other changes",
        "values": [
          null,
          null,
          -30.0,
          null,
          null,
          null,
          null,
          1.0,
          null,
          -30.0,
          229.0,
          199.0
        ],
        "displays": [
          "–",
          "–",
          "–30",
          "–",
          "–",
          "–",
          "–",
          "1",
          "–",
          "–30",
          "229",
          "199"
        ],
        "sourcePage": 4117,
        "sourceLine": 47,
        "sourceLineSha256": "049ba0b52aed89a1857fb933e4b08bcb5d31cd367f20b3b1f907bfe4f3f03a3f",
        "id": "other"
      },
      {
        "label": "Balance at Dec. 31, 2025",
        "values": [
          1283.0,
          14551.0,
          161357.0,
          -5326.0,
          1766.0,
          -66.0,
          293.0,
          142.0,
          14275.0,
          188277.0,
          14777.0,
          203054.0
        ],
        "displays": [
          "1,283",
          "14,551",
          "161,357",
          "–5,326",
          "1,766",
          "–66",
          "293",
          "142",
          "14,275",
          "188,277",
          "14,777",
          "203,054"
        ],
        "sourcePage": 4117,
        "sourceLine": 48,
        "sourceLineSha256": "9e1680ac055cce9aabe38719d98a756bec47ab2052de7dc049a22262c71b029b",
        "id": "closing"
      }
    ]
  },
  "cashflow": {
    "columns": [
      "2025",
      "2024"
    ],
    "rows": [
      {
        "label": "Cash and cash equivalents at beginning of period",
        "values": [
          40296.0,
          43522.0
        ],
        "displays": [
          "40,296",
          "43,522"
        ],
        "sourcePage": 4118,
        "sourceLine": 12,
        "sourceLineSha256": "99571d3172576f05c462619cb1c3439c65fd2a46f615955e78279c1b33727a71",
        "id": "opening"
      },
      {
        "label": "Earnings before tax",
        "values": [
          9307.0,
          16806.0
        ],
        "displays": [
          "9,307",
          "16,806"
        ],
        "sourcePage": 4118,
        "sourceLine": 13,
        "sourceLineSha256": "f0ac655ec669155dc6fcc467aaf804b38aef93805cbc28597b429a406322713e",
        "id": "pretax"
      },
      {
        "label": "Income taxes paid",
        "values": [
          -5152.0,
          -6187.0
        ],
        "displays": [
          "–5,152",
          "–6,187"
        ],
        "sourcePage": 4118,
        "sourceLine": 14,
        "sourceLineSha256": "64d29a4e587e7f14de7d0f0deff50def9a0b73adc44b8ca6f8cdf8e824e00c71",
        "id": "tax"
      },
      {
        "label": "Depreciation and amortization of, and impairment losses on, intangible assets, property, plant and equipment, and investment property¹",
        "values": [
          16866.0,
          12858.0
        ],
        "displays": [
          "16,866",
          "12,858"
        ],
        "sourcePage": 4118,
        "sourceLine": 16,
        "sourceLineSha256": "f74c7fffa5f7ac072de24b518a71642527e735dffe62edd861d29c72ec7dab8a",
        "id": "depreciation"
      },
      {
        "label": "Amortization of and impairment losses on capitalized development costs¹",
        "values": [
          8365.0,
          7209.0
        ],
        "displays": [
          "8,365",
          "7,209"
        ],
        "sourcePage": 4118,
        "sourceLine": 17,
        "sourceLineSha256": "cc8ab2ddd6c4de1aa537679d3188d1e61a9af6ca981bc8e15042fef0585a1f1c",
        "id": "development"
      },
      {
        "label": "Impairment losses on equity investments¹",
        "values": [
          38.0,
          710.0
        ],
        "displays": [
          "38",
          "710"
        ],
        "sourcePage": 4118,
        "sourceLine": 18,
        "sourceLineSha256": "0de6b51d3f36e044b0c073d7572c1d7391d376fb2898a9c77c3f59b95e69b53d",
        "id": "equity_impair"
      },
      {
        "label": "Depreciation of and impairment losses on lease assets¹",
        "values": [
          12203.0,
          11279.0
        ],
        "displays": [
          "12,203",
          "11,279"
        ],
        "sourcePage": 4118,
        "sourceLine": 19,
        "sourceLineSha256": "06635e0e7544f74a75a1c0cff340bcc73bb3721cc6cc62801428838c821fe8d2",
        "id": "lease_depreciation"
      },
      {
        "label": "Gain/loss on disposal of non-current assets and equity investments",
        "values": [
          -95.0,
          110.0
        ],
        "displays": [
          "–95",
          "110"
        ],
        "sourcePage": 4118,
        "sourceLine": 20,
        "sourceLineSha256": "3361f31ef7a1675340b5d54dab36756e46230e4df4447635f713441b7eebaa8d",
        "id": "disposal_gain"
      },
      {
        "label": "Share of the result of equity-accounted investments",
        "values": [
          968.0,
          2362.0
        ],
        "displays": [
          "968",
          "2,362"
        ],
        "sourcePage": 4118,
        "sourceLine": 21,
        "sourceLineSha256": "d7b2803ff8c643b0ed618ca17a2324811e75a22e77992de08dce239e94d2f5e7",
        "id": "equity_adjustment"
      },
      {
        "label": "Other non-cash expense/income",
        "values": [
          -946.0,
          903.0
        ],
        "displays": [
          "–946",
          "903"
        ],
        "sourcePage": 4118,
        "sourceLine": 22,
        "sourceLineSha256": "a0e52d6044b6e730bcc5603e0eb71a6295bcb96084cadc580c1db54ceb6c4d85",
        "id": "other_noncash"
      },
      {
        "label": "Change in inventories",
        "values": [
          -896.0,
          -2695.0
        ],
        "displays": [
          "–896",
          "–2,695"
        ],
        "sourcePage": 4118,
        "sourceLine": 23,
        "sourceLineSha256": "34db97cfe6df25bc14901cf8ac4ee20ed2d479cb7d2678e5e8bfda200681d7fe",
        "id": "inventory"
      },
      {
        "label": "Change in receivables (excluding financial services)",
        "values": [
          -211.0,
          -2083.0
        ],
        "displays": [
          "–211",
          "–2,083"
        ],
        "sourcePage": 4118,
        "sourceLine": 24,
        "sourceLineSha256": "b39edbfed30a8e7b86880f355482c80cdcbb1cabb1eaf1b297547aa34399b004",
        "id": "receivables"
      },
      {
        "label": "Change in liabilities (excluding financial liabilities)",
        "values": [
          3165.0,
          52.0
        ],
        "displays": [
          "3,165",
          "52"
        ],
        "sourcePage": 4118,
        "sourceLine": 25,
        "sourceLineSha256": "59f4b672097c82b294c74bcefee22b51abd7b76f979efa61e1825484a7ea0821",
        "id": "liabilities"
      },
      {
        "label": "Change in provisions",
        "values": [
          1760.0,
          4247.0
        ],
        "displays": [
          "1,760",
          "4,247"
        ],
        "sourcePage": 4118,
        "sourceLine": 26,
        "sourceLineSha256": "1268b9c66ca860eaa565c5d7056a8f46e48f810be4f2bc5fe0cd95b1015ea955",
        "id": "provisions"
      },
      {
        "label": "Change in lease assets",
        "values": [
          -24166.0,
          -19358.0
        ],
        "displays": [
          "–24,166",
          "–19,358"
        ],
        "sourcePage": 4118,
        "sourceLine": 27,
        "sourceLineSha256": "7d260d8c410a5ab121b0bb9f64f8ff7a40a7e105fd215045cac22a87565bc8b3",
        "id": "lease_change"
      },
      {
        "label": "Change in financial services receivables",
        "values": [
          -6196.0,
          -9061.0
        ],
        "displays": [
          "–6,196",
          "–9,061"
        ],
        "sourcePage": 4118,
        "sourceLine": 28,
        "sourceLineSha256": "e7c2d99fb5542fe7531be27e1bbbc5c0d05d36e1e011231deb7b77fe9f2733dd",
        "id": "fs_change"
      },
      {
        "label": "Cash flows from operating activities",
        "values": [
          15009.0,
          17151.0
        ],
        "displays": [
          "15,009",
          "17,151"
        ],
        "sourcePage": 4118,
        "sourceLine": 29,
        "sourceLineSha256": "b7fe320d971baf35de14a358a34133b112ed059ff600a81caabd7c2b405cf213",
        "id": "cfo"
      },
      {
        "label": "Investments in intangible assets (excluding development costs), property, plant and equipment, and investment property",
        "values": [
          -15299.0,
          -17202.0
        ],
        "displays": [
          "–15,299",
          "–17,202"
        ],
        "sourcePage": 4118,
        "sourceLine": 31,
        "sourceLineSha256": "d210a2ad27311fa90c221eb007db1c28261a7ba8aff379755804381ca7ea7170",
        "id": "capex"
      },
      {
        "label": "Additions to capitalized development costs",
        "values": [
          -9047.0,
          -10244.0
        ],
        "displays": [
          "–9,047",
          "–10,244"
        ],
        "sourcePage": 4118,
        "sourceLine": 32,
        "sourceLineSha256": "0e02f286c0f34157dc5077933f687c239b4d66bf227b280d2de1c3f50de7caec",
        "id": "capitalized_dev"
      },
      {
        "label": "Acquisition of subsidiaries",
        "values": [
          -359.0,
          -284.0
        ],
        "displays": [
          "–359",
          "–284"
        ],
        "sourcePage": 4118,
        "sourceLine": 33,
        "sourceLineSha256": "9cd6815d599d4849e3bd04a7e3c2a613d23ce44341671895c5459b471b265682",
        "id": "acquire_subs"
      },
      {
        "label": "Acquisition of other equity investments",
        "values": [
          -2106.0,
          -2152.0
        ],
        "displays": [
          "–2,106",
          "–2,152"
        ],
        "sourcePage": 4118,
        "sourceLine": 34,
        "sourceLineSha256": "3ce69fa0a0316c9bc9d1e86438fdcc6331aafb7bf3b108d6658240db80c962ab",
        "id": "acquire_other"
      },
      {
        "label": "Disposal of subsidiaries",
        "values": [
          67.0,
          -148.0
        ],
        "displays": [
          "67",
          "–148"
        ],
        "sourcePage": 4118,
        "sourceLine": 35,
        "sourceLineSha256": "f23adf9fe872a463ccf28f9663b43bf85e5d27e8aae0e45bc35f62a917e7466a",
        "id": "dispose_subs"
      },
      {
        "label": "Disposal of other equity investments",
        "values": [
          951.0,
          231.0
        ],
        "displays": [
          "951",
          "231"
        ],
        "sourcePage": 4118,
        "sourceLine": 36,
        "sourceLineSha256": "112e03985415bb9ea689df6b3942108f9c8b8eb14fed481b65eb33ce2eafaf38",
        "id": "dispose_other"
      },
      {
        "label": "Proceeds from disposal of intangible assets, property, plant and equipment, and investment property",
        "values": [
          733.0,
          947.0
        ],
        "displays": [
          "733",
          "947"
        ],
        "sourcePage": 4118,
        "sourceLine": 37,
        "sourceLineSha256": "49aaccf0fe15d103c7f3483c6497aa851fb21146f5630466dedbb56ca22da424",
        "id": "dispose_assets"
      },
      {
        "label": "Change in investments in securities and time deposits",
        "values": [
          -1485.0,
          -203.0
        ],
        "displays": [
          "–1,485",
          "–203"
        ],
        "sourcePage": 4118,
        "sourceLine": 38,
        "sourceLineSha256": "3d427c5b8878ac4935fda961bfe46af8bddeffd9d051c67e18a31965bc5613a0",
        "id": "securities"
      },
      {
        "label": "Change in loans",
        "values": [
          -938.0,
          -2517.0
        ],
        "displays": [
          "–938",
          "–2,517"
        ],
        "sourcePage": 4118,
        "sourceLine": 39,
        "sourceLineSha256": "6f0e68f05e41191f07959640dbd5fd68697e1357e33de30c10dca8ae280d6518",
        "id": "loans"
      },
      {
        "label": "Cash flows from investing activities",
        "values": [
          -27484.0,
          -31573.0
        ],
        "displays": [
          "–27,484",
          "–31,573"
        ],
        "sourcePage": 4118,
        "sourceLine": 40,
        "sourceLineSha256": "5203f5c18a9ed87443623a419214aa1184ff20082f3292b1ca5726f831cc567f",
        "id": "cfi"
      },
      {
        "label": "Capital contributions/capital redemptions",
        "values": [
          420.0,
          -1144.0
        ],
        "displays": [
          "420",
          "–1,144"
        ],
        "sourcePage": 4118,
        "sourceLine": 41,
        "sourceLineSha256": "cd18bbc1d503b2e182d317a53aafb75622fe558fbff4ed513c5f60df50c2d5a3",
        "id": "capital"
      },
      {
        "label": "Dividends paid",
        "values": [
          -4460.0,
          -5779.0
        ],
        "displays": [
          "–4,460",
          "–5,779"
        ],
        "sourcePage": 4118,
        "sourceLine": 42,
        "sourceLineSha256": "187eb0ed58b21b7ee2a1a6946f02ebbaa82bde914b16db2acc0281c2d310fb73",
        "id": "dividends"
      },
      {
        "label": "Capital transactions with non-controlling interest shareholders",
        "values": [
          352.0,
          null
        ],
        "displays": [
          "352",
          "–"
        ],
        "sourcePage": 4118,
        "sourceLine": 43,
        "sourceLineSha256": "0e48fdfad00a5b4f624f33f39afe64ee9f102aa1fd9472bb403e84094d0154cd",
        "id": "nci_transactions"
      },
      {
        "label": "Proceeds from issuance of bonds",
        "values": [
          35993.0,
          38420.0
        ],
        "displays": [
          "35,993",
          "38,420"
        ],
        "sourcePage": 4118,
        "sourceLine": 44,
        "sourceLineSha256": "2793eaebcc2a50012c0706d9751a391e5ebb17e6eeab696186b2533db384cf4b",
        "id": "bond_issue"
      },
      {
        "label": "Repayments of bonds",
        "values": [
          -32669.0,
          -32617.0
        ],
        "displays": [
          "–32,669",
          "–32,617"
        ],
        "sourcePage": 4118,
        "sourceLine": 45,
        "sourceLineSha256": "cf1bf27c916c3d4a0569d1ec330ed7cd4e208094af03efffa6a91f644fcfd5e5",
        "id": "bond_repay"
      },
      {
        "label": "Proceeds from issuance of commercial paper and notes 2",
        "values": [
          27549.0,
          13828.0
        ],
        "displays": [
          "27,549",
          "13,828"
        ],
        "sourcePage": 4118,
        "sourceLine": 46,
        "sourceLineSha256": "6958cf89f9d46e54d5508aa62462198781992df70358a4372b0c0af3f2d8953b",
        "id": "paper_issue"
      },
      {
        "label": "Repayments of commercial paper and notes2",
        "values": [
          -30417.0,
          -12414.0
        ],
        "displays": [
          "–30,417",
          "–12,414"
        ],
        "sourcePage": 4118,
        "sourceLine": 47,
        "sourceLineSha256": "31ec2e240c5692616810fb9b8c44b855e35c1d0fcc82cbb5c4ce0bbff00a6fcb",
        "id": "paper_repay"
      },
      {
        "label": "Changes in other financial liabilities2",
        "values": [
          16624.0,
          12179.0
        ],
        "displays": [
          "16,624",
          "12,179"
        ],
        "sourcePage": 4118,
        "sourceLine": 48,
        "sourceLineSha256": "007a5a93123d10e8c482bd088a4456b130faaf05ffa61f8f07ab968f9c6e153f",
        "id": "other_debt"
      },
      {
        "label": "Repayments of lease liabilities",
        "values": [
          -1476.0,
          -1334.0
        ],
        "displays": [
          "–1,476",
          "–1,334"
        ],
        "sourcePage": 4118,
        "sourceLine": 49,
        "sourceLineSha256": "7232f24bff0411602948e244c9aacb7c00a2881f3d52234c2191865be5b3128a",
        "id": "lease_repay"
      },
      {
        "label": "Cash flows from financing activities",
        "values": [
          11918.0,
          11140.0
        ],
        "displays": [
          "11,918",
          "11,140"
        ],
        "sourcePage": 4118,
        "sourceLine": 50,
        "sourceLineSha256": "8000e864764ac07259fb4f9428df9182f08272d80c5310a7e94325c0bc0a2264",
        "id": "cff"
      },
      {
        "label": "Effect of exchange rate changes on cash and cash equivalents",
        "values": [
          -938.0,
          55.0
        ],
        "displays": [
          "–938",
          "55"
        ],
        "sourcePage": 4118,
        "sourceLine": 51,
        "sourceLineSha256": "c5804ee7ba0e6f07930c777172fc8c9b79121606b7b18bf66a7c638a8b5b2638",
        "id": "fx"
      },
      {
        "label": "Change of loss allowance within cash and cash equivalents",
        "values": [
          0.0,
          1.0
        ],
        "displays": [
          "0",
          "1"
        ],
        "sourcePage": 4118,
        "sourceLine": 52,
        "sourceLineSha256": "ef19d5622db788aa1d50b6d9f2b953d03bf1472cbeb14f65905d8b9452c57f92",
        "id": "loss_allowance"
      },
      {
        "label": "Net change in cash and cash equivalents",
        "values": [
          -1495.0,
          -3226.0
        ],
        "displays": [
          "–1,495",
          "–3,226"
        ],
        "sourcePage": 4118,
        "sourceLine": 53,
        "sourceLineSha256": "17db96592847226ba1f29bb7c6475bd2fe130dc980d545b7a4eeae66bdbfb660",
        "id": "change"
      },
      {
        "label": "Cash and cash equivalents at end of period",
        "values": [
          38801.0,
          40296.0
        ],
        "displays": [
          "38,801",
          "40,296"
        ],
        "sourcePage": 4118,
        "sourceLine": 54,
        "sourceLineSha256": "76d4742fb65107174301a29610930ba00b1870b253e282806a0ed0dda22f35a1",
        "id": "closing"
      },
      {
        "label": "Cash and cash equivalents at end of period",
        "values": [
          38801.0,
          40296.0
        ],
        "displays": [
          "38,801",
          "40,296"
        ],
        "sourcePage": 4118,
        "sourceLine": 57,
        "sourceLineSha256": "431596fc69a6ea27997d558b1ee7712aa9596e48e3b2924d10ecd2c39f68e1bf",
        "id": "closing_liquidity"
      },
      {
        "label": "Securities and time deposits and loans",
        "values": [
          47395.0,
          44662.0
        ],
        "displays": [
          "47,395",
          "44,662"
        ],
        "sourcePage": 4118,
        "sourceLine": 58,
        "sourceLineSha256": "434c9f30a717538173e35d13405719947850e1815ea5aeb157b7f237945808b8",
        "id": "securities_loans"
      },
      {
        "label": "Gross liquidity",
        "values": [
          86197.0,
          84959.0
        ],
        "displays": [
          "86,197",
          "84,959"
        ],
        "sourcePage": 4118,
        "sourceLine": 59,
        "sourceLineSha256": "975468afdcbe20aab48e393565b7e60276adbe282c9af91d12732f2a4d5efa7e",
        "id": "gross_liquidity"
      },
      {
        "label": "Total third-party borrowings",
        "values": [
          -264703.0,
          -254081.0
        ],
        "displays": [
          "–264,703",
          "–254,081"
        ],
        "sourcePage": 4118,
        "sourceLine": 60,
        "sourceLineSha256": "d97ec4522d532aa8912b63ec6cc521e00f4bbed441bc8b20679d3c78274b7f36",
        "id": "borrowings"
      },
      {
        "label": "Net liquidity",
        "values": [
          -178506.0,
          -169122.0
        ],
        "displays": [
          "–178,506",
          "–169,122"
        ],
        "sourcePage": 4118,
        "sourceLine": 61,
        "sourceLineSha256": "41940edc8141a40e599b076616e064bc4552d4fc87e6b1d9b5de8caa0d112446",
        "id": "net_liquidity"
      }
    ]
  }
};
export const VOLKSWAGEN_HASHES = {
  "core": "38e5fb89fbfca4ce7089c10346a7d6f7c3cfb7b8af5f56fd7d60d7dad9f1ce38",
  "primary": "dd4380bb43f701dd2bf50bdfd6e878f2bcfae00e6a8eaf664a08d3b8f43c24e2",
  "sourceMatrix": "90a674871bc9eabbafbec6b084beaedb623693046cf338baa4984468be709b5f",
  "management": "3c7b202c098807a3ab7704c1a3932366c257a429680b0f02feb447780d41920f",
  "annex": "3d86bcd2222b092e05b951c80480e3d38f040811b95b91129aa3309bef2e786e",
  "sustainability": "93774f8a33e0a544f565fea836ee01a84fcd841dbaa815fe0b50764325eb6056"
};
function freeze(x:unknown):void{if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x);}}
freeze(VOLKSWAGEN_REVIEWED);freeze(VOLKSWAGEN_PRIMARY_ROWS);freeze(VOLKSWAGEN_HASHES);
