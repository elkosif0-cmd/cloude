/* Unchanged reviewed issuer model; original model SHA-256 df62613a3f343d6939b914ea76a4c9f1bb408030671519177500a0683a4cc401. No test-oracle dependency. */
function deepFreeze<T>(value:T):T {
  if(value && typeof value==='object' && !Object.isFrozen(value)){
    Object.freeze(value);for(const child of Object.values(value))deepFreeze(child);
  }
  return value;
}
export const HOME_DEPOT_SOURCE_DATA = deepFreeze({
  "issuer": "The Home Depot, Inc.",
  "source": {
    "pdf": "global_financial_and_audit_research_bundle_extended_verified.pdf",
    "sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "physical_pages_total": 12506,
    "review_range": [
      2040,
      2131
    ],
    "hash_verified": true
  },
  "status": "complete within assigned source range",
  "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
  "basis": "U.S. GAAP",
  "reporting_currency": "USD",
  "units_default": "millions except per-share data",
  "periods": {
    "2025": {
      "end": "2026-02-01",
      "weeks": 52
    },
    "2024": {
      "end": "2025-02-02",
      "weeks": 53
    },
    "2023": {
      "end": "2024-01-28",
      "weeks": 52
    }
  },
  "facts_source": "page-ledger.jsonl",
  "scope_controls": [
    "53-week2024 vs52-week2025 and2023",
    "Primary segment differs from consolidated issuer",
    "transactions/average ticket/online metrics exclude HD Supply/SRS/GMS",
    "forecast capex and dividends not historical actuals",
    "non-GAAP ROIC/NOPAT/adjustedEPS distinct from GAAP"
  ],
  "assurance": {
    "auditor": "KPMG LLP",
    "auditor_since": 1979,
    "report_date": "2026-03-18",
    "financial_statements_opinion": "unqualified; U.S. GAAP consolidated two balance sheet dates and three fiscal years",
    "icfr_opinion": "effective in all material respects under COSO 2013",
    "icfr_exception": "GMS excluded from management and KPMG ICFR assessment, approximately 3% consolidated assets excluding goodwill and intangibles, and 1% net sales; GMS included in consolidated financial statements",
    "source_pages": [
      2084,
      2085,
      2120,
      2121
    ]
  },
  "schema_version": "1.0",
  "source_scope": "Annual report physical pages 2040–2131 inclusive, newly reviewed; no historical coverage restored and no web substitutes",
  "table_conventions": {
    "currency": "USD",
    "amounts": "millions unless explicitly overridden",
    "flow_columns": [
      "FY2025",
      "FY2024",
      "FY2023"
    ],
    "balance_columns": [
      "2026-02-01",
      "2025-02-02"
    ],
    "expense_sign": "Earnings statement expenses positive; cash outflows, contra-equity and negative OCI signed",
    "dashes": "Numerical dashes in financial tables stored as zero, except suppressed/immaterial figures remain unquantified",
    "source_citations": "Physical PDF pages; report page generally physical page minus 2047 for 2048–2128. Annual-report supplement page 2129 is unnumbered."
  },
  "no_transaction_generation": true,
  "statements": {
    "balance_sheet": {
      "source_pages": [
        2086
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "cash_and_equivalents": [
          1389,
          1659
        ],
        "receivables_net": [
          5597,
          4903
        ],
        "merchandise_inventory": [
          25817,
          23451
        ],
        "other_current_assets": [
          1588,
          1670
        ],
        "current_assets": [
          34391,
          31683
        ],
        "net_ppe": [
          28021,
          26702
        ],
        "operating_lease_rou": [
          9204,
          8592
        ],
        "goodwill": [
          22344,
          19475
        ],
        "intangibles_net": [
          10329,
          8983
        ],
        "other_assets": [
          806,
          684
        ],
        "total_assets": [
          105095,
          96119
        ],
        "short_term_debt": [
          4464,
          316
        ],
        "accounts_payable": [
          11491,
          11938
        ],
        "accrued_salaries": [
          2529,
          2315
        ],
        "sales_tax_payable": [
          508,
          628
        ],
        "deferred_revenue": [
          2575,
          2610
        ],
        "income_tax_payable": [
          114,
          832
        ],
        "current_long_term_debt": [
          4967,
          4582
        ],
        "current_operating_leases": [
          1418,
          1274
        ],
        "other_accrued": [
          4358,
          4166
        ],
        "current_liabilities": [
          32424,
          28661
        ],
        "noncurrent_debt": [
          46341,
          48485
        ],
        "noncurrent_operating_leases": [
          8160,
          7633
        ],
        "deferred_tax_liabilities": [
          2845,
          1962
        ],
        "other_longterm_liabilities": [
          2512,
          2738
        ],
        "total_liabilities": [
          92282,
          89479
        ],
        "common_stock": [
          90,
          90
        ],
        "paid_in_capital": [
          14809,
          14117
        ],
        "retained_earnings": [
          94537,
          89533
        ],
        "aoci": [
          -652,
          -1129
        ],
        "treasury_stock": [
          -95971,
          -95971
        ],
        "equity": [
          12813,
          6640
        ],
        "liabilities_and_equity": [
          105095,
          96119
        ]
      }
    },
    "earnings": {
      "source_pages": [
        2087
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions, except EPS in USD/share and weighted shares in millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "net_sales": [
          164683,
          159514,
          152669
        ],
        "cost_of_sales": [
          109818,
          106206,
          101709
        ],
        "gross_profit": [
          54865,
          53308,
          50960
        ],
        "sga": [
          30702,
          28748,
          26598
        ],
        "operating_depreciation_amortization": [
          3273,
          3034,
          2673
        ],
        "total_operating_expenses": [
          33975,
          31782,
          29271
        ],
        "operating_income": [
          20890,
          21526,
          21689
        ],
        "interest_income_other_net": [
          -124,
          -201,
          -178
        ],
        "interest_expense": [
          2412,
          2321,
          1943
        ],
        "interest_other_net": [
          2288,
          2120,
          1765
        ],
        "pretax_earnings": [
          18602,
          19406,
          19924
        ],
        "income_taxes": [
          4446,
          4600,
          4781
        ],
        "net_earnings": [
          14156,
          14806,
          15143
        ],
        "basic_weighted_shares_millions": [
          993,
          990,
          999
        ],
        "basic_eps_USD": [
          14.26,
          14.96,
          15.16
        ],
        "diluted_weighted_shares_millions": [
          995,
          993,
          1002
        ],
        "diluted_eps_USD": [
          14.23,
          14.91,
          15.11
        ]
      }
    },
    "comprehensive_income": {
      "source_pages": [
        2088
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "net_earnings": [
          14156,
          14806,
          15143
        ],
        "fx_translation_net_tax": [
          469,
          -605,
          232
        ],
        "cash_flow_hedges_net_tax": [
          11,
          -45,
          8
        ],
        "other_net_tax": [
          -3,
          -2,
          1
        ],
        "total_oci": [
          477,
          -652,
          241
        ],
        "comprehensive_income": [
          14633,
          14154,
          15384
        ]
      }
    },
    "equity_rollforward": {
      "source_pages": [
        2089
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "common_begin": [
          90,
          90,
          90
        ],
        "common_issuance": [
          0,
          0,
          0
        ],
        "common_end": [
          90,
          90,
          90
        ],
        "apic_begin": [
          14117,
          13147,
          12592
        ],
        "employee_stock_net": [
          170,
          530,
          175
        ],
        "sbc_equity": [
          522,
          440,
          380
        ],
        "apic_end": [
          14809,
          14117,
          13147
        ],
        "retained_begin": [
          89533,
          83656,
          76896
        ],
        "net_earnings": [
          14156,
          14806,
          15143
        ],
        "dividends": [
          -9152,
          -8929,
          -8383
        ],
        "retained_end": [
          94537,
          89533,
          83656
        ],
        "aoci_begin": [
          -1129,
          -477,
          -718
        ],
        "fx_translation": [
          469,
          -605,
          232
        ],
        "cash_flow_hedges": [
          11,
          -45,
          8
        ],
        "other_oci": [
          -3,
          -2,
          1
        ],
        "aoci_end": [
          -652,
          -1129,
          -477
        ],
        "treasury_begin": [
          -95971,
          -95372,
          -87298
        ],
        "treasury_repurchases": [
          0,
          -599,
          -8074
        ],
        "treasury_end": [
          -95971,
          -95971,
          -95372
        ],
        "equity_end": [
          12813,
          6640,
          1044
        ]
      }
    },
    "cash_flows": {
      "source_pages": [
        2090
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "net_earnings": [
          14156,
          14806,
          15143
        ],
        "da_excluding_intangibles": [
          3514,
          3336,
          3061
        ],
        "intangible_amortization": [
          607,
          425,
          186
        ],
        "stock_compensation": [
          522,
          442,
          380
        ],
        "receivables_change": [
          107,
          174,
          134
        ],
        "inventory_change": [
          -1498,
          -743,
          4137
        ],
        "other_current_assets_change": [
          124,
          86,
          -184
        ],
        "ap_accrued_change": [
          -1058,
          518,
          -1411
        ],
        "deferred_revenue_change": [
          -61,
          -165,
          -318
        ],
        "tax_payable_change": [
          -698,
          809,
          -25
        ],
        "deferred_tax_change": [
          418,
          15,
          -245
        ],
        "other_operations": [
          192,
          107,
          314
        ],
        "operating_cash": [
          16325,
          19810,
          21172
        ],
        "capital_expenditure": [
          -3679,
          -3485,
          -3226
        ],
        "acquisition_payments_net": [
          -5410,
          -17644,
          -1514
        ],
        "other_investing": [
          109,
          98,
          11
        ],
        "investing_cash": [
          -8980,
          -21031,
          -4729
        ],
        "short_debt_proceeds_net": [
          4148,
          316,
          0
        ],
        "long_debt_proceeds_net_discount": [
          2161,
          10010,
          1995
        ],
        "long_debt_repaid": [
          -5040,
          -1536,
          -1271
        ],
        "share_repurchases": [
          0,
          -649,
          -7951
        ],
        "common_stock_proceeds": [
          314,
          395,
          323
        ],
        "dividends": [
          -9152,
          -8929,
          -8383
        ],
        "other_financing": [
          -145,
          -301,
          -156
        ],
        "financing_cash": [
          -7714,
          -694,
          -15443
        ],
        "cash_change_before_fx": [
          -369,
          -1915,
          1000
        ],
        "cash_fx": [
          99,
          -186,
          3
        ],
        "cash_begin": [
          1659,
          3760,
          2757
        ],
        "cash_end": [
          1389,
          1659,
          3760
        ],
        "cash_interest_net_capitalized": [
          2405,
          2199,
          1809
        ],
        "noncash_capex": [
          272,
          250,
          364
        ],
        "noncash_acquisition_consideration": [
          0,
          321,
          0
        ]
      }
    }
  },
  "note_tables": {
    "receivables": {
      "source_pages": [
        2091
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "card": [
          1021,
          1019
        ],
        "rebate": [
          1421,
          1404
        ],
        "customer": [
          2588,
          1896
        ],
        "other": [
          567,
          584
        ],
        "total": [
          5597,
          4903
        ]
      }
    },
    "supplier_finance": {
      "source_pages": [
        2094
      ],
      "columns": [
        "FY2025",
        "FY2024"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "begin": [
          598,
          514
        ],
        "invoices_confirmed": [
          4394,
          5140
        ],
        "paid": [
          -4578,
          -5056
        ],
        "end": [
          414,
          598
        ]
      }
    },
    "primary_segment": {
      "source_pages": [
        2098
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "Primary reportable segment: U.S., Canada and Mexico operating segments; excludes SRS/GMS",
      "basis": "U.S. GAAP",
      "rows": {
        "sales": [
          151966,
          153108,
          152669
        ],
        "cost_of_sales": [
          99717,
          101194,
          101709
        ],
        "sga": [
          28885,
          27822,
          26598
        ],
        "operating_da": [
          2790,
          2779,
          2673
        ],
        "operating_income": [
          20574,
          21313,
          21689
        ]
      }
    },
    "segment_reconciliation": {
      "source_pages": [
        2098,
        2099
      ],
      "columns": [
        "FY2025",
        "FY2024"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "primary_sales": [
          151966,
          153108
        ],
        "other_sales": [
          12717,
          6406
        ],
        "consolidated_sales": [
          164683,
          159514
        ],
        "primary_operating_income": [
          20574,
          21313
        ],
        "other_operating_income": [
          316,
          213
        ],
        "consolidated_operating_income": [
          20890,
          21526
        ],
        "primary_da_including_cogs": [
          3344,
          3350
        ],
        "other_da_including_cogs": [
          715,
          358
        ],
        "consolidated_da_including_cogs": [
          4059,
          3708
        ],
        "primary_intangible_amortization": [
          209,
          207
        ],
        "other_intangible_amortization": [
          398,
          218
        ]
      }
    },
    "product_lines": {
      "source_pages": [
        2099
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "building_materials": [
          52439,
          52862,
          52572
        ],
        "decor": [
          51679,
          52525,
          52750
        ],
        "hardlines": [
          47848,
          47721,
          47347
        ],
        "primary_sales": [
          151966,
          153108,
          152669
        ],
        "other": [
          12717,
          6406,
          0
        ],
        "total": [
          164683,
          159514,
          152669
        ]
      }
    },
    "department_sales": {
      "source_pages": [
        2100
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "Primary segment departments; department percentage denominator in source is consolidated sales",
      "basis": "U.S. GAAP",
      "rows": {
        "appliances": [
          13987,
          14068,
          13875
        ],
        "bath": [
          6495,
          6462,
          6580
        ],
        "building_materials": [
          12375,
          12429,
          12098
        ],
        "electrical": [
          8010,
          7875,
          7993
        ],
        "flooring": [
          8232,
          8692,
          8703
        ],
        "hardware": [
          8983,
          8982,
          8956
        ],
        "indoor_garden": [
          10176,
          10302,
          10276
        ],
        "kitchen_blinds": [
          7982,
          7889,
          7999
        ],
        "lighting": [
          4006,
          4221,
          4549
        ],
        "lumber": [
          11391,
          11768,
          11734
        ],
        "millwork": [
          8187,
          8328,
          8456
        ],
        "outdoor_garden": [
          10467,
          10329,
          10384
        ],
        "paint": [
          10977,
          11193,
          11044
        ],
        "plumbing": [
          12476,
          12462,
          12291
        ],
        "power": [
          13168,
          13210,
          12850
        ],
        "storage_organization": [
          5054,
          4898,
          4881
        ],
        "primary_total": [
          151966,
          153108,
          152669
        ]
      }
    },
    "geographic_sales": {
      "source_pages": [
        2100
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "us": [
          152170,
          147007,
          140083
        ],
        "outside_us": [
          12513,
          12507,
          12586
        ],
        "total": [
          164683,
          159514,
          152669
        ]
      }
    },
    "sales_products_services": {
      "source_pages": [
        2100
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "products": [
          159029,
          153674,
          146835
        ],
        "services": [
          5654,
          5840,
          5834
        ],
        "total": [
          164683,
          159514,
          152669
        ]
      }
    },
    "geographic_ppe": {
      "source_pages": [
        2099
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02",
        "2024-01-28"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "us": [
          25139,
          24193,
          23347
        ],
        "outside_us": [
          2882,
          2509,
          2807
        ],
        "total": [
          28021,
          26702,
          26154
        ]
      }
    },
    "ppe": {
      "source_pages": [
        2101
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "land": [
          9499,
          9060
        ],
        "buildings": [
          21321,
          20260
        ],
        "equipment": [
          20289,
          18474
        ],
        "leasehold_improvements": [
          2571,
          2423
        ],
        "construction_progress": [
          1654,
          1521
        ],
        "finance_leases": [
          4133,
          4045
        ],
        "cost": [
          59467,
          55783
        ],
        "accumulated_depreciation": [
          -31446,
          -29081
        ],
        "net": [
          28021,
          26702
        ]
      }
    },
    "lease_balance": {
      "source_pages": [
        2101
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "op_assets": [
          9204,
          8592
        ],
        "finance_net_assets": [
          2563,
          2638
        ],
        "total_assets": [
          11767,
          11230
        ],
        "op_current_liabilities": [
          1418,
          1274
        ],
        "finance_current_liabilities": [
          288,
          272
        ],
        "op_noncurrent_liabilities": [
          8160,
          7633
        ],
        "finance_noncurrent_liabilities": [
          2675,
          2749
        ],
        "total_liabilities": [
          12541,
          11928
        ]
      }
    },
    "lease_cost_cash": {
      "source_pages": [
        2102
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "operating_cost": [
          1846,
          1661,
          1359
        ],
        "finance_amortization": [
          322,
          328,
          304
        ],
        "finance_interest": [
          113,
          118,
          126
        ],
        "variable_cost": [
          585,
          566,
          486
        ],
        "operating_lease_cfo": [
          1847,
          1601,
          1328
        ],
        "finance_lease_interest_cfo": [
          113,
          118,
          126
        ],
        "finance_principal_cff": [
          327,
          380,
          271
        ],
        "noncash_new_op": [
          1741,
          1384,
          1827
        ],
        "noncash_new_finance": [
          263,
          153,
          336
        ]
      }
    },
    "lease_maturities": {
      "source_pages": [
        2102
      ],
      "columns": [
        "operating",
        "finance"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "FY2026": [
          1792,
          391
        ],
        "FY2027": [
          1806,
          386
        ],
        "FY2028": [
          1607,
          346
        ],
        "FY2029": [
          1386,
          318
        ],
        "FY2030": [
          1062,
          294
        ],
        "thereafter": [
          3985,
          1856
        ],
        "total_payments": [
          11638,
          3591
        ],
        "imputed_interest": [
          -2060,
          -628
        ],
        "present_value": [
          9578,
          2963
        ]
      },
      "excludes_uncommenced_payments": 675
    },
    "goodwill_rollforward": {
      "source_pages": [
        2103
      ],
      "columns": [
        "Primary",
        "Other",
        "Consolidated"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "2024-01-28": [
          8455,
          0,
          8455
        ],
        "FY2024_acquisitions": [
          23,
          11025,
          11048
        ],
        "FY2024_other": [
          -28,
          0,
          -28
        ],
        "2025-02-02": [
          8450,
          11025,
          19475
        ],
        "FY2025_acquisitions": [
          86,
          2757,
          2843
        ],
        "FY2025_other": [
          28,
          -2,
          26
        ],
        "2026-02-01": [
          8564,
          13780,
          22344
        ]
      }
    },
    "intangibles": {
      "source_pages": [
        2103
      ],
      "columns": [
        "2026_gross",
        "2026_accumulated_amortization",
        "2026_net",
        "2025_gross",
        "2025_accumulated_amortization",
        "2025_net"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "customer_relationships": [
          10517,
          -1535,
          8982,
          8845,
          -1035,
          7810
        ],
        "definite_trade_names": [
          889,
          -191,
          698,
          610,
          -86,
          524
        ],
        "other_definite": [
          1,
          -1,
          0,
          11,
          -11,
          0
        ],
        "indefinite_trade_names": [
          649,
          0,
          649,
          649,
          0,
          649
        ],
        "total": [
          12056,
          -1727,
          10329,
          10115,
          -1132,
          8983
        ]
      }
    },
    "future_intangible_amortization": {
      "source_pages": [
        2104
      ],
      "columns": [
        "2026-02-01_estimate"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "FY2026": [
          683
        ],
        "FY2027": [
          674
        ],
        "FY2028": [
          654
        ],
        "FY2029": [
          615
        ],
        "FY2030": [
          578
        ],
        "thereafter": [
          6476
        ],
        "total": [
          9680
        ]
      }
    },
    "senior_notes_detail": {
      "source_pages": [
        2105
      ],
      "units": "USD millions",
      "as_of": "2026-02-01; prior carrying amount 2025-02-02",
      "instruments": [
        {
          "instrument": "2.70% Senior notes due April 2025",
          "interest_payable": "Semi-annually",
          "principal_2026": 0,
          "carrying_2026": 0,
          "carrying_2025": 500
        },
        {
          "instrument": "5.125% Senior notes due April 2025",
          "interest_payable": "Semi-annually",
          "principal_2026": 0,
          "carrying_2026": 0,
          "carrying_2025": 500
        },
        {
          "instrument": "3.35% Senior notes due September 2025",
          "interest_payable": "Semi-annually",
          "principal_2026": 0,
          "carrying_2026": 0,
          "carrying_2025": 999
        },
        {
          "instrument": "4.00% Senior notes due September 2025",
          "interest_payable": "Semi-annually",
          "principal_2026": 0,
          "carrying_2026": 0,
          "carrying_2025": 749
        },
        {
          "instrument": "Floating rate Senior notes due December 2025",
          "interest_payable": "Quarterly",
          "principal_2026": 0,
          "carrying_2026": 0,
          "carrying_2025": 599
        },
        {
          "instrument": "5.10% Senior notes due December 2025",
          "interest_payable": "Semi-annually",
          "principal_2026": 0,
          "carrying_2026": 0,
          "carrying_2025": 898
        },
        {
          "instrument": "3.00% Senior notes due April 2026",
          "interest_payable": "Semi-annually",
          "principal_2026": 1300,
          "carrying_2026": 1299,
          "carrying_2025": 1297
        },
        {
          "instrument": "5.15% Senior notes due June 2026",
          "interest_payable": "Semi-annually",
          "principal_2026": 1500,
          "carrying_2026": 1499,
          "carrying_2025": 1496
        },
        {
          "instrument": "2.125% Senior notes due September 2026",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 999,
          "carrying_2025": 997
        },
        {
          "instrument": "4.95% Senior notes due September 2026",
          "interest_payable": "Semi-annually",
          "principal_2026": 750,
          "carrying_2026": 749,
          "carrying_2025": 747
        },
        {
          "instrument": "2.875% Senior notes due April 2027",
          "interest_payable": "Semi-annually",
          "principal_2026": 750,
          "carrying_2026": 748,
          "carrying_2025": 747
        },
        {
          "instrument": "2.50% Senior notes due April 2027",
          "interest_payable": "Semi-annually",
          "principal_2026": 750,
          "carrying_2026": 749,
          "carrying_2025": 747
        },
        {
          "instrument": "4.875% Senior notes due June 2027",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 997,
          "carrying_2025": 995
        },
        {
          "instrument": "2.80% Senior notes due September 2027",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 993,
          "carrying_2025": 984
        },
        {
          "instrument": "0.90% Senior notes due March 2028",
          "interest_payable": "Semi-annually",
          "principal_2026": 500,
          "carrying_2026": 498,
          "carrying_2025": 497
        },
        {
          "instrument": "1.50% Senior notes due September 2028",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 997,
          "carrying_2025": 995
        },
        {
          "instrument": "3.75% Senior notes due September 2028",
          "interest_payable": "Semi-annually",
          "principal_2026": 500,
          "carrying_2026": 498,
          "carrying_2025": 0
        },
        {
          "instrument": "3.90% Senior notes due December 2028",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 987,
          "carrying_2025": 972
        },
        {
          "instrument": "4.90% Senior notes due April 2029",
          "interest_payable": "Semi-annually",
          "principal_2026": 750,
          "carrying_2026": 745,
          "carrying_2025": 744
        },
        {
          "instrument": "2.95% Senior notes due June 2029",
          "interest_payable": "Semi-annually",
          "principal_2026": 1750,
          "carrying_2026": 1704,
          "carrying_2025": 1672
        },
        {
          "instrument": "4.75% Senior notes due June 2029",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1241,
          "carrying_2025": 1239
        },
        {
          "instrument": "2.70% Senior notes due April 2030",
          "interest_payable": "Semi-annually",
          "principal_2026": 1500,
          "carrying_2026": 1401,
          "carrying_2025": 1359
        },
        {
          "instrument": "3.95% Senior notes due September 2030",
          "interest_payable": "Semi-annually",
          "principal_2026": 500,
          "carrying_2026": 496,
          "carrying_2025": 0
        },
        {
          "instrument": "1.375% Senior notes due March 2031",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1192,
          "carrying_2025": 1173
        },
        {
          "instrument": "4.85% Senior notes due June 2031",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 991,
          "carrying_2025": 989
        },
        {
          "instrument": "1.875% Senior notes due September 2031",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 955,
          "carrying_2025": 939
        },
        {
          "instrument": "3.25% Senior notes due April 2032",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1241,
          "carrying_2025": 1240
        },
        {
          "instrument": "4.50% Senior notes due September 2032",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1244,
          "carrying_2025": 1244
        },
        {
          "instrument": "4.95% Senior notes due June 2034",
          "interest_payable": "Semi-annually",
          "principal_2026": 1750,
          "carrying_2026": 1727,
          "carrying_2025": 1725
        },
        {
          "instrument": "4.65% Senior notes due September 2035",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 993,
          "carrying_2025": 0
        },
        {
          "instrument": "5.875% Senior notes due December 2036",
          "interest_payable": "Semi-annually",
          "principal_2026": 3000,
          "carrying_2026": 2901,
          "carrying_2025": 2879
        },
        {
          "instrument": "3.30% Senior notes due April 2040",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1111,
          "carrying_2025": 1071
        },
        {
          "instrument": "5.40% Senior notes due September 2040",
          "interest_payable": "Semi-annually",
          "principal_2026": 500,
          "carrying_2026": 496,
          "carrying_2025": 496
        },
        {
          "instrument": "5.95% Senior notes due April 2041",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 991,
          "carrying_2025": 991
        },
        {
          "instrument": "4.20% Senior notes due April 2043",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 953,
          "carrying_2025": 937
        },
        {
          "instrument": "4.875% Senior notes due February 2044",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 983,
          "carrying_2025": 982
        },
        {
          "instrument": "4.40% Senior notes due March 2045",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 981,
          "carrying_2025": 981
        },
        {
          "instrument": "4.25% Senior notes due April 2046",
          "interest_payable": "Semi-annually",
          "principal_2026": 1600,
          "carrying_2026": 1587,
          "carrying_2025": 1587
        },
        {
          "instrument": "3.90% Senior notes due June 2047",
          "interest_payable": "Semi-annually",
          "principal_2026": 1150,
          "carrying_2026": 1145,
          "carrying_2025": 1145
        },
        {
          "instrument": "4.50% Senior notes due December 2048",
          "interest_payable": "Semi-annually",
          "principal_2026": 1500,
          "carrying_2026": 1467,
          "carrying_2025": 1466
        },
        {
          "instrument": "3.125% Senior notes due December 2049",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1191,
          "carrying_2025": 1176
        },
        {
          "instrument": "3.35% Senior notes due April 2050",
          "interest_payable": "Semi-annually",
          "principal_2026": 1500,
          "carrying_2026": 1473,
          "carrying_2025": 1473
        },
        {
          "instrument": "2.375% Senior notes due March 2051",
          "interest_payable": "Semi-annually",
          "principal_2026": 1250,
          "carrying_2026": 1171,
          "carrying_2025": 1152
        },
        {
          "instrument": "2.75% Senior notes due September 2051",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 984,
          "carrying_2025": 984
        },
        {
          "instrument": "3.625% Senior notes due April 2052",
          "interest_payable": "Semi-annually",
          "principal_2026": 1500,
          "carrying_2026": 1460,
          "carrying_2025": 1459
        },
        {
          "instrument": "4.95% Senior notes due September 2052",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 981,
          "carrying_2025": 980
        },
        {
          "instrument": "5.30% Senior notes due June 2054",
          "interest_payable": "Semi-annually",
          "principal_2026": 1500,
          "carrying_2026": 1467,
          "carrying_2025": 1466
        },
        {
          "instrument": "3.50% Senior notes due September 2056",
          "interest_payable": "Semi-annually",
          "principal_2026": 1000,
          "carrying_2026": 975,
          "carrying_2025": 974
        },
        {
          "instrument": "5.40% Senior notes due June 2064",
          "interest_payable": "Semi-annually",
          "principal_2026": 500,
          "carrying_2026": 488,
          "carrying_2025": 489
        }
      ],
      "principal_total": 48800,
      "carrying_total_2026": 47748,
      "carrying_total_2025": 49731
    },
    "debt_reconciliation": {
      "source_pages": [
        2105
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "senior_notes_carrying": [
          47748,
          49731
        ],
        "finance_leases": [
          2963,
          3021
        ],
        "other_longterm_debt": [
          597,
          315
        ],
        "total_debt": [
          51308,
          53067
        ],
        "current_installments": [
          -4967,
          -4582
        ],
        "noncurrent": [
          46341,
          48485
        ]
      }
    },
    "debt_maturities_ex_leases": {
      "source_pages": [
        2106
      ],
      "columns": [
        "2026-02-01"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "FY2026": [
          4684
        ],
        "FY2027": [
          3625
        ],
        "FY2028": [
          3115
        ],
        "FY2029": [
          3852
        ],
        "FY2030": [
          2072
        ],
        "thereafter": [
          32049
        ],
        "total": [
          49397
        ]
      }
    },
    "pretax_geography": {
      "source_pages": [
        2107
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "us": [
          17431,
          18119,
          18681
        ],
        "foreign": [
          1171,
          1287,
          1243
        ],
        "total": [
          18602,
          19406,
          19924
        ]
      }
    },
    "income_tax_provision": {
      "source_pages": [
        2108
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "current_federal": [
          2812,
          3417,
          3764
        ],
        "current_state": [
          725,
          836,
          882
        ],
        "current_foreign": [
          414,
          386,
          365
        ],
        "current_total": [
          3951,
          4639,
          5011
        ],
        "deferred_federal": [
          503,
          -67,
          -228
        ],
        "deferred_state": [
          46,
          25,
          12
        ],
        "deferred_foreign": [
          -54,
          3,
          -14
        ],
        "deferred_total": [
          495,
          -39,
          -230
        ],
        "federal_total": [
          3315,
          3350,
          3536
        ],
        "state_total": [
          771,
          861,
          894
        ],
        "foreign_total": [
          360,
          389,
          351
        ],
        "total": [
          4446,
          4600,
          4781
        ]
      }
    },
    "tax_rate_bridge": {
      "source_pages": [
        2108
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "statutory_21pct": [
          3906,
          4075,
          4184
        ],
        "state_local_net_federal": [
          663,
          701,
          698
        ],
        "foreign_effects": [
          190,
          164,
          133
        ],
        "tax_credits": [
          -142,
          -150,
          -142
        ],
        "other": [
          -171,
          -190,
          -92
        ],
        "total": [
          4446,
          4600,
          4781
        ]
      }
    },
    "cash_tax": {
      "source_pages": [
        2108
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "federal": [
          3590,
          2475,
          3737
        ],
        "domestic_state_local": [
          799,
          792,
          854
        ],
        "foreign": [
          459,
          386,
          432
        ],
        "total": [
          4848,
          3653,
          5023
        ]
      },
      "california_disaggregation": {
        "FY2025": "below 5% threshold, included in other; not zero",
        "FY2024": 186,
        "FY2023": "below 5% threshold, included in other; not zero"
      }
    },
    "deferred_tax": {
      "source_pages": [
        2109
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "dta_deferred_compensation": [
          289,
          230
        ],
        "dta_self_insurance": [
          262,
          271
        ],
        "dta_state_tax": [
          118,
          133
        ],
        "dta_nondeductible_reserves": [
          450,
          475
        ],
        "dta_nol": [
          95,
          92
        ],
        "dta_leases": [
          2358,
          2255
        ],
        "dta_deferred_revenue": [
          265,
          259
        ],
        "dta_other": [
          79,
          77
        ],
        "dta_total": [
          3916,
          3792
        ],
        "valuation_allowance": [
          -6,
          -4
        ],
        "dta_net": [
          3910,
          3788
        ],
        "dtl_inventory": [
          -26,
          -12
        ],
        "dtl_ppe": [
          -1514,
          -854
        ],
        "dtl_intangibles_goodwill": [
          -2438,
          -2200
        ],
        "dtl_rou": [
          -2276,
          -2178
        ],
        "dtl_unremitted": [
          -42,
          -54
        ],
        "dtl_other": [
          -167,
          -183
        ],
        "dtl_total": [
          -6463,
          -5481
        ],
        "net_deferred_tax": [
          -2553,
          -1693
        ],
        "balance_sheet_dta": [
          292,
          269
        ],
        "balance_sheet_dtl": [
          -2845,
          -1962
        ]
      }
    },
    "unrecognized_tax_benefits": {
      "source_pages": [
        2110
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "begin": [
          627,
          689,
          643
        ],
        "current_additions": [
          67,
          71,
          74
        ],
        "prior_additions": [
          11,
          3,
          13
        ],
        "prior_reductions": [
          -71,
          -42,
          -14
        ],
        "settlements": [
          -33,
          -51,
          0
        ],
        "statute_expiration": [
          -42,
          -43,
          -27
        ],
        "end": [
          559,
          627,
          689
        ],
        "affect_etr_if_recognized": [
          464,
          509,
          568
        ]
      }
    },
    "common_shares": {
      "source_pages": [
        2111
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "shares millions except USD dividends per share",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "issued_begin": [
          1800,
          1796,
          1794
        ],
        "employee_net": [
          2,
          4,
          2
        ],
        "issued_end": [
          1802,
          1800,
          1796
        ],
        "treasury_begin": [
          -806,
          -804,
          -778
        ],
        "treasury_repurchase": [
          0,
          -2,
          -26
        ],
        "treasury_end": [
          -806,
          -806,
          -804
        ],
        "outstanding": [
          996,
          994,
          992
        ],
        "cash_dividend_per_share_USD": [
          9.2,
          9.0,
          8.36
        ]
      }
    },
    "fair_values": {
      "source_pages": [
        2112
      ],
      "columns": [
        "2026-02-01",
        "2025-02-02"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "derivative_level2_liabilities": [
          -559,
          -795
        ],
        "senior_notes_level1_fair_value": [
          44653,
          45499
        ],
        "senior_notes_carrying": [
          47748,
          49731
        ]
      }
    },
    "stock_compensation": {
      "source_pages": [
        2112
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "pretax": [
          524,
          444,
          382
        ],
        "tax_benefit": [
          -108,
          -92,
          -79
        ],
        "after_tax": [
          416,
          352,
          303
        ]
      }
    },
    "stock_awards_rollforward": {
      "source_pages": [
        2113,
        2114,
        2115
      ],
      "period": "FY2025",
      "shares_unit": "thousands",
      "rows": {
        "options": {
          "begin": 2201,
          "granted": 249,
          "exercised": -257,
          "forfeited": -37,
          "end": 2156,
          "weighted_exercise_price_USD": 249.25
        },
        "restricted_and_rsu": {
          "begin": 3050,
          "granted": 1365,
          "vested": -1083,
          "forfeited": -217,
          "end": 3115,
          "weighted_grant_fv_USD": 350.21
        },
        "performance": {
          "begin": 1208,
          "granted": 384,
          "vested": -29,
          "forfeited": -120,
          "end": 1443,
          "weighted_grant_fv_USD": 300.43
        }
      }
    },
    "benefit_contributions": {
      "source_pages": [
        2116
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "contributions": [
          382,
          347,
          293
        ]
      }
    },
    "weighted_shares": {
      "source_pages": [
        2116
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "shares millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "U.S. GAAP",
      "rows": {
        "basic": [
          993,
          990,
          999
        ],
        "dilutive_awards": [
          2,
          3,
          3
        ],
        "diluted": [
          995,
          993,
          1002
        ],
        "antidilutive_excluded": [
          0,
          0,
          1
        ]
      }
    }
  },
  "acquisitions": {
    "GMS": {
      "pages": [
        2116,
        2117,
        2118
      ],
      "close": "2025-09-04",
      "seller_consideration_per_share_USD": 110,
      "purchase_consideration": 5081,
      "cash_shares": 4257,
      "mandatory_debt_repaid_in_consideration": 824,
      "discretionary_debt_assumed_then_financing_repayment": 354,
      "cash_spend_including_discretionary_debt_derived": 5435,
      "cash_acquired": 136,
      "net_acquisition_cash_excluding_financing_derived": 4945,
      "ppa_status": "preliminary; intangible/tangible valuations, tax and goodwill remain open; one-year measurement period",
      "assets": {
        "cash": 136,
        "receivables": 899,
        "inventory": 568,
        "ppe": 715,
        "goodwill": 2610,
        "intangibles": 1800,
        "other": 458
      },
      "assets_total": 7186,
      "liabilities": {
        "ap": 380,
        "other_current": 414,
        "senior_notes": 354,
        "deferred_tax": 403,
        "other_longterm": 554
      },
      "liabilities_total": 2105,
      "customer_relationships": {
        "fair_value": 1540,
        "life_years": 19
      },
      "trade_names": {
        "fair_value": 260,
        "life_years": 7
      },
      "goodwill_deductible_approx": 214,
      "goodwill_primary_segment": 0,
      "acquired_period_sales_approx": 2000,
      "acquired_period_earnings": "immaterial; not quantified",
      "proforma": "not presented; acquisition deemed immaterial to financial results"
    },
    "SRS": {
      "pages": [
        2118,
        2119,
        2120
      ],
      "close": "2024-06-18",
      "purchase_consideration": 18028,
      "cash_consideration": 17707,
      "noncash_stock_consideration": 321,
      "ppa_status": "finalized Q1 FY2025; measurement adjustments immaterial",
      "assets": {
        "cash": 161,
        "receivables": 1831,
        "inventory": 1988,
        "ppe": 789,
        "goodwill": 11003,
        "intangibles": 5780,
        "other": 744
      },
      "assets_total": 22296,
      "liabilities": {
        "ap": 1791,
        "other_current": 584,
        "deferred_tax": 1111,
        "other_longterm": 782
      },
      "liabilities_total": 4268,
      "customer_relationships": {
        "fair_value": 5400,
        "life_years": 20
      },
      "trade_names": {
        "fair_value": 380,
        "life_years": 5
      },
      "goodwill_deductible_approx": 1000,
      "goodwill_primary_segment": 0,
      "FY2024_acquired_period_sales_approx": 6400,
      "FY2024_acquired_period_earnings": "immaterial; not quantified",
      "proforma": "not presented; acquisition deemed immaterial to financial results"
    }
  },
  "non_gaap": {
    "roic": {
      "source_pages": [
        2078
      ],
      "columns": [
        "FY2025",
        "FY2024",
        "FY2023"
      ],
      "units": "USD millions",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "Non-GAAP ROIC/NOPAT; bridge starts from GAAP net earnings",
      "rows": {
        "net_earnings": [
          14156,
          14806,
          15143
        ],
        "interest_other_net": [
          2288,
          2120,
          1765
        ],
        "tax_provision": [
          4446,
          4600,
          4781
        ],
        "operating_income": [
          20890,
          21526,
          21689
        ],
        "income_tax_adjustment": [
          -4993,
          -5102,
          -5205
        ],
        "nopat": [
          15897,
          16424,
          16484
        ],
        "average_debt_equity": [
          61914,
          52431,
          44955
        ],
        "roic_pct": [
          25.7,
          31.3,
          36.7
        ]
      },
      "definition": "Trailing twelve-month NOPAT divided by average opening/closing long-term debt including current installments plus equity. Excludes commercial paper from stated denominator. Acquisition results only from close; FY2024 includes 53 weeks."
    },
    "adjusted_eps": {
      "source_pages": [
        2129
      ],
      "columns": [
        "FY2025",
        "FY2024"
      ],
      "units": "USD per diluted share",
      "entity_scope": "The Home Depot, Inc. and consolidated subsidiaries",
      "basis": "Non-GAAP adjusted diluted EPS; no acquired-revenue adjustment",
      "rows": {
        "gaap_diluted_eps": [
          14.23,
          14.91
        ],
        "acquired_intangible_amortization": [
          0.61,
          0.43
        ],
        "tax_effect": [
          -0.15,
          -0.1
        ],
        "adjusted_diluted_eps": [
          14.69,
          15.24
        ]
      }
    }
  },
  "operating_metrics": {
    "pages": [
      2048,
      2055,
      2071,
      2072,
      2075,
      2076,
      2077
    ],
    "stores": {
      "us_and_territories": 2035,
      "canada": 182,
      "mexico": 142,
      "total": 2359,
      "FY2025_opened": 12
    },
    "srs_locations": "over 1,250, separate from stores",
    "associates": {
      "us": 422500,
      "canada": 31700,
      "mexico": 17800,
      "other": 400,
      "total": 472400,
      "salaried_approx": 53400
    },
    "inventory_turnover": {
      "FY2025": 4.4,
      "FY2024": 4.7
    },
    "comparable_sales_pct": {
      "FY2025": 0.3,
      "FY2024": -1.8,
      "FY2023": -3.2
    },
    "FY2025_us_comps_pct": 0.5,
    "FY2025_comparable_transactions_pct": -1.0,
    "FY2025_comparable_ticket_pct": 1.4,
    "transactions_millions": [
      1601.5,
      1637.2,
      1621.8
    ],
    "average_ticket_USD": [
      90.56,
      89.31,
      90.07
    ],
    "online_sales_FY2025_percent": 15.9,
    "online_sales_growth_actual_pct": 8.7,
    "online_sales_growth_comparable_weeks_pct": 10.4,
    "metric_scope": "Transactions, average ticket and online sales exclude HD Supply and SRS (including GMS). Comparable-sales methods are supplemental and industry methods vary. FY2025 weeks1–52 vs FY2024 weeks2–53.",
    "FY2024_extra_week_sales_approx": 2500,
    "FY2024_extra_week_eps_approx": 0.3,
    "FY2025_fx_sales_impact": -307
  },
  "liquidity_and_commitments": {
    "pages": [
      2078,
      2079,
      2080,
      2082,
      2104,
      2106,
      2107,
      2116
    ],
    "cash_foreign_approx": 1000,
    "cp_limit": 11000,
    "cp_outstanding": 4464,
    "cp_weighted_rate_pct": 3.7,
    "cp_max_FY2025_approx": 5800,
    "backup_facilities_drawn": 0,
    "backup_facilities": [
      {
        "amount": 3500,
        "maturity": "2030-05"
      },
      {
        "amount": 3500,
        "maturity": "2026-07"
      },
      {
        "amount": 3000,
        "maturity": "2028-07"
      },
      {
        "amount": 1000,
        "maturity": "2026-07"
      }
    ],
    "senior_principal": 48800,
    "future_senior_interest_approx": 25400,
    "next12mo_senior_interest_approx": 2000,
    "purchase_obligations_approx": 1900,
    "purchase_obligations_next12mo_approx": 1200,
    "letters_credit": 738,
    "lease_payments_including_uncommenced_approx": 15900,
    "uncommenced_leases": 675,
    "floating_senior_after_swaps_approx": 5400,
    "one_pct_rate_sensitivity": 54,
    "swap_notional": 5400,
    "swap_liability": 558,
    "posted_cash_collateral": 459,
    "covenants": "Compliant at February1,2026; no undrawn backup balances; senior indentures generally no leverage/ratio/net-worth constraints",
    "FY2026_capex_forecast_approx": 4000,
    "FY2026_capex_forecast_pct_sales": 2.5,
    "FY2026_buybacks": "No plans to resume while reducing debt",
    "subsequent_quarterly_dividend_USD": 2.33,
    "subsequent_dividend_announced": "February2026"
  },
  "accounting_policy_model": [
    {
      "pages": [
        2091
      ],
      "topic": "Consolidation and period",
      "policy": "Consolidated subsidiaries; eliminate intercompany balances and transactions. Fiscal Sunday nearest January31; no parent-only statements in assigned report."
    },
    {
      "pages": [
        2092,
        2081,
        2082
      ],
      "topic": "Inventory",
      "policy": "Majority retail method lower of cost/market. Canada/Mexico retail, distribution centers and SRS use cost methods primarily moving-average/FIFO, lower of cost/NRV. Capitalized inventory costs include freight/import and sourcing/distribution operations/depreciation net qualifying vendor allowances. Store-specific estimated shrink between counts uses recent results; 10% rate increase would add approximately79m COGS."
    },
    {
      "pages": [
        2095,
        2096
      ],
      "topic": "Revenue and vendor allowances",
      "policy": "Revenue net returns and sales tax upon possession/service completion. Return liability and asset estimated. Product/service deferred revenue approximately1500m and unredeemed gift cards approximately1100m at both dates; duration usually≤3months, gifts generally redeemed≤6months. PLCC provider receivables not consolidated. Rebates and non-specific co-op allowances reduce inventory/COGS; specific incremental identifiable advertising reimbursements reduce SG&A."
    },
    {
      "pages": [
        2092,
        2093,
        2094,
        2103,
        2104
      ],
      "topic": "Long-lived assets and impairment",
      "policy": "PPE straight-line buildings/leasehold5–45years, equipment2–20; capitalized software3–7. Store-level recoverability uses undiscounted cash flows then fair value; impairment immaterial. Goodwill not amortized, annualQ3 and trigger testing. Definite intangibles straight-line up to20years; indefinite annualQ3. No goodwill/intangible impairment2023–25."
    },
    {
      "pages": [
        2093,
        2101,
        2102
      ],
      "topic": "Leases",
      "policy": "Lease identified via controlled identified asset. Options included when reasonably certain, usually no renewal assumption at commencement. Quarterly updated secured incremental borrowing rate if implicit unavailable. Shortterm≤12months expensed; certain lease/nonlease components combined. Variable non-index payments excluded from liability. Finance principal CFF, interest CFO, operating payments CFO."
    },
    {
      "pages": [
        2094
      ],
      "topic": "Supplier finance and derivatives",
      "policy": "Supplier financing optional with third-party discount; original supplier terms generally30–60days unchanged, no guarantees/security, AP and CFO classification. Derivatives risk-management-only, gross FV presentation; cash-flow/net-investment changes AOCI until realization; fair-value hedges offset debt changes in earnings."
    },
    {
      "pages": [
        2095,
        2096,
        2097,
        2109,
        2110
      ],
      "topic": "Taxes, insurance and equity",
      "policy": "Tax asset/liability method; more-likely-than-not recognition and >50% realized measurement; GILTI current-period election. Tax interest interest expense, penalties SG&A. Self-insurance undiscounted expected ultimate claims based actuarial/history, approximately1600m liability. Treasury stock at weighted-average cost including repurchase excise tax."
    },
    {
      "pages": [
        2097
      ],
      "topic": "Accounting changes",
      "policy": "ASU2023-09 adopted retrospectivelyQ4FY2025, disclosure-only. ASU2025-06 software and ASU2024-03 expense disaggregation not yet adopted; impact being evaluated."
    },
    {
      "pages": [
        2113,
        2114,
        2115
      ],
      "topic": "Stock compensation",
      "policy": "FV-based service-period expense with estimated forfeitures. Options Black-Scholes; restricted/RSUs stock-price-based; performance awards use operating/ROIC and SRS EBITDA/sales targets, market conditions MonteCarlo. Share-activity units thousands, not millions."
    }
  ],
  "material_risks_and_controls": {
    "pages": [
      2056,
      2057,
      2058,
      2059,
      2060,
      2061,
      2062,
      2063,
      2064,
      2065,
      2066,
      2067,
      2068,
      2069,
      2070,
      2072,
      2120,
      2121
    ],
    "risks": [
      "Housing affordability and turnover, high rates and macro uncertainty",
      "Tariff/import/sourcing and commodity-price volatility",
      "Inventory shrink and store/customer/associate safety",
      "Technology, cyber, privacy and AI compliance/operational dependence",
      "Delivery/supply-chain and interconnected-investment execution",
      "Acquisition integration, valuation estimates and control complexity",
      "Trade-credit defaults, payment fraud, wages and labor availability",
      "Weather/storm demand, climate, product quality/liability and installation-contractor compliance"
    ],
    "realized_disclosures": [
      "No material cybersecurity incident determined in fiscal2025",
      "Lead-safe EPA decree terminatedQ4FY2025 after finalQ2penalty payment; total penalties approximately1.7m collected from installers",
      "No current ordinary-course proceeding management expects materially adverse",
      "Accounting/finance system migration ongoing with control design changes"
    ],
    "audit_cam": "Retail-inventory evidence sufficiency in highly automated multi-system data interfaces, with specialized IT-control audit work; not a qualified opinion"
  },
  "limitations_and_exceptions": [
    {
      "type": "external_content_not_in_range",
      "pages": [
        2122,
        2123,
        2124,
        2125,
        2126,
        2127
      ],
      "detail": "Proxy-incorporated compensation, ownership, related-party/governance detail and accountant fees, and most referenced exhibits are not reproduced in pages2040–2131. Index references read; external contents not claimed reviewed."
    },
    {
      "type": "assurance_scope",
      "pages": [
        2120,
        2121
      ],
      "detail": "GMS excluded from ICFR assessment/audit only. Do not remove from audited consolidated financial statements or imply clean ICFR covers GMS."
    },
    {
      "type": "measurement_preliminary",
      "pages": [
        2117,
        2118
      ],
      "detail": "GMS PPA remains preliminary; exact final allocations not supplied."
    },
    {
      "type": "rounding_and_undefined_derivation",
      "pages": [
        2087,
        2090,
        2098,
        2101,
        2112
      ],
      "detail": "EPS denominators shown in whole millions. Cashflow D&A excluding intangibles3514 differs Note3 depreciation3452 by62 in FY2025 (2024:53;2023:41); source does not bridge this difference. SBC total expense524 differs CF/equity522 in2025; preserve distinct source concepts rather than inventing a reconciliation."
    },
    {
      "type": "not_transaction_ledger",
      "detail": "Annual-report aggregates and policies do not establish underlying journal entries, invoices, transaction chronology or complete subsidiary trial balances. No synthetic business transactions generated."
    },
    {
      "type": "not_current_advice",
      "detail": "Historical source model as reported March18,2026; no subsequent developments or current law independently checked."
    }
  ]
});
