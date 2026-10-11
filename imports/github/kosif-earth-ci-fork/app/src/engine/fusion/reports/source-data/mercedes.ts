/* Reviewed supplied-source models; exact source-specific scopes remain separate.
   Runtime copy has no dependency on the independent frozen test oracle. */
export const MERCEDES_REVIEWED = {
  "core": {
    "schema": "mercedes-source-model-v1",
    "company": "Mercedes-Benz Group",
    "report_year": 2025,
    "source_pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "status": "selected_primary_statements_and_detailed_notes_not_full_report_assurance",
    "tables": {
      "income": {
        "source_physical_pages": [
          3492
        ],
        "source_report_pages": [
          252
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "revenue": {
            "2025": "132214",
            "2024": "145594"
          },
          "cost_sales": {
            "2025": "-109881",
            "2024": "-117018"
          },
          "gross_profit": {
            "2025": "22333",
            "2024": "28576"
          },
          "selling": {
            "2025": "-9718",
            "2024": "-9993"
          },
          "administration": {
            "2025": "-2477",
            "2024": "-2529"
          },
          "research_noncapitalized": {
            "2025": "-6055",
            "2024": "-5580"
          },
          "other_operating_income": {
            "2025": "1551",
            "2024": "2507"
          },
          "other_operating_expense": {
            "2025": "-1025",
            "2024": "-483"
          },
          "equity_method": {
            "2025": "1118",
            "2024": "1138"
          },
          "other_financial": {
            "2025": "93",
            "2024": "-37"
          },
          "ebit": {
            "2025": "5820",
            "2024": "13599"
          },
          "interest_income": {
            "2025": "623",
            "2024": "738"
          },
          "interest_expense": {
            "2025": "-159",
            "2024": "-190"
          },
          "pretax": {
            "2025": "6284",
            "2024": "14147"
          },
          "tax": {
            "2025": "-953",
            "2024": "-3738"
          },
          "net_profit": {
            "2025": "5331",
            "2024": "10409"
          },
          "nci_profit": {
            "2025": "190",
            "2024": "202"
          },
          "parent_profit": {
            "2025": "5141",
            "2024": "10207"
          }
        }
      },
      "oci": {
        "source_physical_pages": [
          3493
        ],
        "source_report_pages": [
          253
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "net_profit": {
            "2025": "5331",
            "2024": "10409"
          },
          "currency_translation": {
            "2025": "-1525",
            "2024": "1001"
          },
          "debt": {
            "2025": "3",
            "2024": "9"
          },
          "derivatives": {
            "2025": "808",
            "2024": "-1181"
          },
          "equity_method_reclassifiable": {
            "2025": "-508",
            "2024": "3"
          },
          "reclassifiable_total": {
            "2025": "-1222",
            "2024": "-168"
          },
          "pensions": {
            "2025": "1020",
            "2024": "1045"
          },
          "equity": {
            "2025": "-57",
            "2024": "-126"
          },
          "equity_method_nonreclassifiable": {
            "2025": "157",
            "2024": "23"
          },
          "nonreclassifiable_total": {
            "2025": "1120",
            "2024": "942"
          },
          "oci": {
            "2025": "-102",
            "2024": "774"
          },
          "oci_nci": {
            "2025": "-114",
            "2024": "5"
          },
          "oci_parent": {
            "2025": "12",
            "2024": "769"
          },
          "comprehensive": {
            "2025": "5229",
            "2024": "11183"
          },
          "comprehensive_nci": {
            "2025": "76",
            "2024": "207"
          },
          "comprehensive_parent": {
            "2025": "5153",
            "2024": "10976"
          }
        }
      },
      "assets": {
        "source_physical_pages": [
          3494
        ],
        "source_report_pages": [
          254
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "intangible": {
            "2025": "20547",
            "2024": "19436"
          },
          "ppe_rou": {
            "2025": "27340",
            "2024": "26537"
          },
          "operating_leases": {
            "2025": "39472",
            "2024": "45220"
          },
          "equity_method": {
            "2025": "10037",
            "2024": "12786"
          },
          "fs_noncurrent": {
            "2025": "41902",
            "2024": "48547"
          },
          "securities_noncurrent": {
            "2025": "626",
            "2024": "644"
          },
          "other_financial_noncurrent": {
            "2025": "2953",
            "2024": "3020"
          },
          "deferred_tax": {
            "2025": "6090",
            "2024": "4335"
          },
          "income_tax_noncurrent": {
            "2025": "426",
            "2024": "327"
          },
          "other_noncurrent": {
            "2025": "3941",
            "2024": "2391"
          },
          "noncurrent_total": {
            "2025": "153334",
            "2024": "163243"
          },
          "inventory": {
            "2025": "23933",
            "2024": "26234"
          },
          "trade_receivables": {
            "2025": "5851",
            "2024": "6973"
          },
          "fs_current": {
            "2025": "34387",
            "2024": "39320"
          },
          "cash": {
            "2025": "12254",
            "2024": "14511"
          },
          "securities_current": {
            "2025": "6940",
            "2024": "7086"
          },
          "other_financial_current": {
            "2025": "2852",
            "2024": "2868"
          },
          "income_tax_current": {
            "2025": "1257",
            "2024": "1034"
          },
          "other_current": {
            "2025": "3645",
            "2024": "3581"
          },
          "held_for_sale": {
            "2025": "11013",
            "2024": "160"
          },
          "current_total": {
            "2025": "102132",
            "2024": "101767"
          },
          "total_assets": {
            "2025": "255466",
            "2024": "265010"
          }
        }
      },
      "equity_liabilities": {
        "source_physical_pages": [
          3495
        ],
        "source_report_pages": [
          255
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "share_capital": {
            "2025": "3070",
            "2024": "3070"
          },
          "capital_reserves": {
            "2025": "11718",
            "2024": "11718"
          },
          "retained_earnings": {
            "2025": "77631",
            "2024": "75469"
          },
          "other_reserves": {
            "2025": "1163",
            "2024": "2368"
          },
          "treasury_shares": {
            "2025": "-325",
            "2024": "0"
          },
          "parent_equity": {
            "2025": "93257",
            "2024": "92625"
          },
          "nci": {
            "2025": "983",
            "2024": "1005"
          },
          "equity": {
            "2025": "94240",
            "2024": "93630"
          },
          "pension": {
            "2025": "807",
            "2024": "952"
          },
          "provisions_noncurrent": {
            "2025": "7612",
            "2024": "7332"
          },
          "debt_noncurrent": {
            "2025": "62410",
            "2024": "73487"
          },
          "financial_noncurrent": {
            "2025": "1278",
            "2024": "1490"
          },
          "deferred_tax": {
            "2025": "10201",
            "2024": "7497"
          },
          "contract_refund_noncurrent": {
            "2025": "2942",
            "2024": "3100"
          },
          "income_tax_noncurrent": {
            "2025": "1020",
            "2024": "1342"
          },
          "other_noncurrent": {
            "2025": "1188",
            "2024": "1354"
          },
          "noncurrent_total": {
            "2025": "87458",
            "2024": "96554"
          },
          "trade_payables": {
            "2025": "10665",
            "2024": "11312"
          },
          "provisions_current": {
            "2025": "7846",
            "2024": "7688"
          },
          "debt_current": {
            "2025": "37596",
            "2024": "39311"
          },
          "financial_current": {
            "2025": "4277",
            "2024": "4071"
          },
          "contract_refund_current": {
            "2025": "7955",
            "2024": "8146"
          },
          "income_tax_current": {
            "2025": "646",
            "2024": "705"
          },
          "other_current": {
            "2025": "3443",
            "2024": "3547"
          },
          "held_for_sale": {
            "2025": "1340",
            "2024": "46"
          },
          "current_total": {
            "2025": "73768",
            "2024": "74826"
          },
          "total_equity_liabilities": {
            "2025": "255466",
            "2024": "265010"
          }
        }
      },
      "cash_flow": {
        "source_physical_pages": [
          3496,
          3497
        ],
        "source_report_pages": [
          256,
          257
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_group_including_cash_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "pretax": {
            "2025": "6284",
            "2024": "14147"
          },
          "da_impairment": {
            "2025": "7223",
            "2024": "6772"
          },
          "other_noncash": {
            "2025": "-1204",
            "2024": "-1362"
          },
          "disposal_gains_losses": {
            "2025": "65",
            "2024": "18"
          },
          "inventory_change": {
            "2025": "724",
            "2024": "737"
          },
          "trade_change": {
            "2025": "895",
            "2024": "-1199"
          },
          "fs_receivable_change": {
            "2025": "5828",
            "2024": "3280"
          },
          "leased_vehicle_change": {
            "2025": "-4060",
            "2024": "-3110"
          },
          "other_operating_change": {
            "2025": "2585",
            "2024": "986"
          },
          "equity_method_dividends": {
            "2025": "1330",
            "2024": "1918"
          },
          "tax_paid": {
            "2025": "-1664",
            "2024": "-4452"
          },
          "cfo": {
            "2025": "18006",
            "2024": "17735"
          },
          "ppe_acquisition": {
            "2025": "-5482",
            "2024": "-4039"
          },
          "intangible_acquisition": {
            "2025": "-4260",
            "2024": "-4626"
          },
          "ppe_intangible_disposal": {
            "2025": "191",
            "2024": "188"
          },
          "shareholding_acquisition": {
            "2025": "-304",
            "2024": "-363"
          },
          "shareholding_disposal": {
            "2025": "413",
            "2024": "716"
          },
          "securities_acquisition": {
            "2025": "-12303",
            "2024": "-6785"
          },
          "securities_disposal": {
            "2025": "12557",
            "2024": "6160"
          },
          "other_investing": {
            "2025": "-12",
            "2024": "-1"
          },
          "cfi": {
            "2025": "-9200",
            "2024": "-8750"
          },
          "short_financing_change": {
            "2025": "-3558",
            "2024": "-3171"
          },
          "long_financing_additions": {
            "2025": "28598",
            "2024": "38338"
          },
          "long_financing_repayment": {
            "2025": "-30970",
            "2024": "-35355"
          },
          "parent_dividend": {
            "2025": "-4140",
            "2024": "-5486"
          },
          "nci_dividend": {
            "2025": "-183",
            "2024": "-239"
          },
          "treasury_purchase_cash": {
            "2025": "-360",
            "2024": "-4921"
          },
          "other_financing": {
            "2025": "160",
            "2024": "82"
          },
          "cff": {
            "2025": "-10453",
            "2024": "-10752"
          },
          "fx": {
            "2025": "-593",
            "2024": "311"
          },
          "cash_change": {
            "2025": "-2240",
            "2024": "-1456"
          }
        }
      },
      "cash_bridge": {
        "source_physical_pages": [
          3497
        ],
        "source_report_pages": [
          257
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "opening_closing_stock_bridge",
        "entity_scope": "consolidated_group_cash_with_and_without_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening_total": {
            "2025": "14516",
            "2024": "15972"
          },
          "opening_hfs": {
            "2025": "5",
            "2024": "10"
          },
          "opening_balance_sheet": {
            "2025": "14511",
            "2024": "15962"
          },
          "closing_total": {
            "2025": "12276",
            "2024": "14516"
          },
          "closing_hfs": {
            "2025": "22",
            "2024": "5"
          },
          "closing_balance_sheet": {
            "2025": "12254",
            "2024": "14511"
          }
        },
        "row_period_roles": {
          "opening_total": "start_of_year",
          "opening_hfs": "start_of_year",
          "opening_balance_sheet": "start_of_year",
          "closing_total": "end_of_year",
          "closing_hfs": "end_of_year",
          "closing_balance_sheet": "end_of_year"
        }
      },
      "equity_rollforward": {
        "source_physical_pages": [
          3498
        ],
        "source_report_pages": [
          258
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_total_equity",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening": {
            "2025": "93630",
            "2024": "92816"
          },
          "net_profit": {
            "2025": "5331",
            "2024": "10409"
          },
          "oci": {
            "2025": "-102",
            "2024": "774"
          },
          "comprehensive": {
            "2025": "5229",
            "2024": "11183"
          },
          "dividends": {
            "2025": "-4325",
            "2024": "-5728"
          },
          "scope_changes": {
            "2025": "4",
            "2024": "128"
          },
          "capital_increase": {
            "2025": "89",
            "2024": "5"
          },
          "treasury_purchase_accrual": {
            "2025": "-381",
            "2024": "-4809"
          },
          "treasury_issue": {
            "2025": "56",
            "2024": "73"
          },
          "other": {
            "2025": "-62",
            "2024": "-38"
          },
          "closing": {
            "2025": "94240",
            "2024": "93630"
          }
        },
        "row_period_roles": {
          "opening": "opening_stock",
          "net_profit": "annual_flow",
          "oci": "annual_flow",
          "comprehensive": "annual_flow",
          "dividends": "annual_flow",
          "scope_changes": "annual_flow",
          "capital_increase": "annual_flow",
          "treasury_purchase_accrual": "annual_flow",
          "treasury_issue": "annual_flow",
          "other": "annual_flow",
          "closing": "closing_stock"
        }
      },
      "tax_reconciliation": {
        "source_physical_pages": [
          3534
        ],
        "source_report_pages": [
          294
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "current_tax": {
            "2025": "-1231",
            "2024": "-3908"
          },
          "deferred_tax": {
            "2025": "278",
            "2024": "170"
          },
          "deferred_temporary": {
            "2025": "-790",
            "2024": "135"
          },
          "deferred_losses_credits": {
            "2025": "1068",
            "2024": "35"
          },
          "expected_tax": {
            "2025": "-1874",
            "2024": "-4219"
          },
          "foreign_rate": {
            "2025": "270",
            "2024": "307"
          },
          "trade_rate": {
            "2025": "48",
            "2024": "26"
          },
          "law_change": {
            "2025": "723",
            "2024": "78"
          },
          "unrecognized_deferred_change": {
            "2025": "-59",
            "2024": "-76"
          },
          "taxfree_nondeductible": {
            "2025": "-33",
            "2024": "376"
          },
          "other": {
            "2025": "-28",
            "2024": "-230"
          },
          "actual_tax": {
            "2025": "-953",
            "2024": "-3738"
          }
        }
      },
      "deferred_tax": {
        "source_physical_pages": [
          3536
        ],
        "source_report_pages": [
          296
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_group_gross_and_offset",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "gross_assets": {
            "2025": "15062",
            "2024": "16521"
          },
          "gross_liabilities": {
            "2025": "-18968",
            "2024": "-19566"
          },
          "unrecognized": {
            "2025": "-205",
            "2024": "-117"
          },
          "unrecognized_temporary": {
            "2025": "-61",
            "2024": "-1"
          },
          "unrecognized_losses": {
            "2025": "-144",
            "2024": "-116"
          },
          "unbalanced_assets": {
            "2025": "14857",
            "2024": "16404"
          },
          "unbalanced_liabilities": {
            "2025": "-18968",
            "2024": "-19566"
          },
          "balanced_assets": {
            "2025": "6090",
            "2024": "4335"
          },
          "balanced_liabilities": {
            "2025": "-10201",
            "2024": "-7497"
          },
          "net": {
            "2025": "-4111",
            "2024": "-3162"
          }
        }
      },
      "deferred_tax_rollforward": {
        "source_physical_pages": [
          3537
        ],
        "source_report_pages": [
          297
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening": {
            "2025": "-3162",
            "2024": "-3587"
          },
          "income_statement": {
            "2025": "278",
            "2024": "170"
          },
          "equity_oci": {
            "2025": "1",
            "2024": "30"
          },
          "debt_oci": {
            "2025": "-1",
            "2024": "-3"
          },
          "derivatives_oci": {
            "2025": "-336",
            "2024": "504"
          },
          "pensions_oci": {
            "2025": "-777",
            "2024": "-226"
          },
          "other": {
            "2025": "-114",
            "2024": "-50"
          },
          "closing": {
            "2025": "-4111",
            "2024": "-3162"
          }
        },
        "row_period_roles": {
          "opening": "opening_stock",
          "income_statement": "annual_flow",
          "equity_oci": "annual_flow",
          "debt_oci": "annual_flow",
          "derivatives_oci": "annual_flow",
          "pensions_oci": "annual_flow",
          "other": "annual_flow",
          "closing": "closing_stock"
        }
      },
      "operating_lease_assets": {
        "source_physical_pages": [
          3541
        ],
        "source_report_pages": [
          301
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "opening_closing_stock_bridge",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "cost_opening": {
            "2025": "58197",
            "2024": "54820"
          },
          "cost_additions": {
            "2025": "24742",
            "2024": "24269"
          },
          "cost_transfers": {
            "2025": "0",
            "2024": "3"
          },
          "cost_hfs": {
            "2025": "-10649",
            "2024": "0"
          },
          "cost_disposals": {
            "2025": "-19958",
            "2024": "-21788"
          },
          "cost_other": {
            "2025": "-2492",
            "2024": "893"
          },
          "cost_closing": {
            "2025": "49840",
            "2024": "58197"
          },
          "dep_opening": {
            "2025": "12977",
            "2024": "13108"
          },
          "dep_additions": {
            "2025": "7882",
            "2024": "7895"
          },
          "dep_hfs": {
            "2025": "-2703",
            "2024": "0"
          },
          "dep_disposals": {
            "2025": "-7152",
            "2024": "-8240"
          },
          "dep_other": {
            "2025": "-636",
            "2024": "214"
          },
          "dep_closing": {
            "2025": "10368",
            "2024": "12977"
          },
          "carrying": {
            "2025": "39472",
            "2024": "45220"
          }
        },
        "row_period_roles": {
          "cost_opening": "opening_stock",
          "cost_additions": "annual_flow",
          "cost_transfers": "annual_flow",
          "cost_hfs": "annual_flow",
          "cost_disposals": "annual_flow",
          "cost_other": "annual_flow",
          "cost_closing": "closing_stock",
          "dep_opening": "opening_stock",
          "dep_additions": "annual_flow",
          "dep_hfs": "annual_flow",
          "dep_disposals": "annual_flow",
          "dep_other": "annual_flow",
          "dep_closing": "closing_stock",
          "carrying": "closing_stock"
        }
      },
      "lease_maturity": {
        "source_physical_pages": [
          3541
        ],
        "source_report_pages": [
          301
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "future_contractual_cash_flows",
        "entity_scope": "consolidated_operating_leases_undiscounted",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "within_1y": {
            "2025": "8821",
            "2024": "7957"
          },
          "1_2y": {
            "2025": "7091",
            "2024": "6036"
          },
          "2_3y": {
            "2025": "3515",
            "2024": "3846"
          },
          "3_4y": {
            "2025": "1538",
            "2024": "2047"
          },
          "4_5y": {
            "2025": "326",
            "2024": "473"
          },
          "later_5y": {
            "2025": "151",
            "2024": "142"
          },
          "total": {
            "2025": "21442",
            "2024": "20501"
          }
        }
      },
      "fs_receivables": {
        "source_physical_pages": [
          3546
        ],
        "source_report_pages": [
          306
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_balance_sheet_excluding_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "customer_current": {
            "2025": "13187",
            "2024": "15753"
          },
          "customer_noncurrent": {
            "2025": "25469",
            "2024": "29886"
          },
          "customer_total": {
            "2025": "38656",
            "2024": "45639"
          },
          "dealer_current": {
            "2025": "15438",
            "2024": "17138"
          },
          "dealer_noncurrent": {
            "2025": "5123",
            "2024": "5874"
          },
          "dealer_total": {
            "2025": "20561",
            "2024": "23012"
          },
          "lease_current": {
            "2025": "5927",
            "2024": "6687"
          },
          "lease_noncurrent": {
            "2025": "11406",
            "2024": "12745"
          },
          "lease_total": {
            "2025": "17333",
            "2024": "19432"
          },
          "residual_current": {
            "2025": "212",
            "2024": "175"
          },
          "residual_noncurrent": {
            "2025": "512",
            "2024": "714"
          },
          "residual_total": {
            "2025": "724",
            "2024": "889"
          },
          "gross_current": {
            "2025": "34764",
            "2024": "39753"
          },
          "gross_noncurrent": {
            "2025": "42510",
            "2024": "49219"
          },
          "gross_total": {
            "2025": "77274",
            "2024": "88972"
          },
          "allowance_current": {
            "2025": "-377",
            "2024": "-433"
          },
          "allowance_noncurrent": {
            "2025": "-608",
            "2024": "-672"
          },
          "allowance_total": {
            "2025": "-985",
            "2024": "-1105"
          },
          "net_current": {
            "2025": "34387",
            "2024": "39320"
          },
          "net_noncurrent": {
            "2025": "41902",
            "2024": "48547"
          },
          "net_total": {
            "2025": "76289",
            "2024": "87867"
          }
        }
      },
      "finance_lease": {
        "source_physical_pages": [
          3547
        ],
        "source_report_pages": [
          307
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_finance_lease_receivables_excluding_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "payments": {
            "2025": "18663",
            "2024": "20850"
          },
          "within_1y": {
            "2025": "6675",
            "2024": "7371"
          },
          "1_2y": {
            "2025": "4457",
            "2024": "5406"
          },
          "2_3y": {
            "2025": "3519",
            "2024": "3975"
          },
          "3_4y": {
            "2025": "2362",
            "2024": "2703"
          },
          "4_5y": {
            "2025": "1257",
            "2024": "1187"
          },
          "later_5y": {
            "2025": "393",
            "2024": "208"
          },
          "unguaranteed_residual": {
            "2025": "859",
            "2024": "887"
          },
          "gross_investment": {
            "2025": "19522",
            "2024": "21737"
          },
          "unearned_income": {
            "2025": "-2189",
            "2024": "-2305"
          },
          "gross_carrying": {
            "2025": "17333",
            "2024": "19432"
          },
          "allowance": {
            "2025": "-266",
            "2024": "-323"
          },
          "net_carrying": {
            "2025": "17067",
            "2024": "19109"
          }
        }
      },
      "ecl_total": {
        "source_physical_pages": [
          3548
        ],
        "source_report_pages": [
          308
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "opening_closing_stock_bridge",
        "entity_scope": "financial_services_receivables_including_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening": {
            "2025": "1105",
            "2024": "1055"
          },
          "additions": {
            "2025": "244",
            "2024": "293"
          },
          "remeasurement": {
            "2025": "388",
            "2024": "361"
          },
          "utilization": {
            "2025": "-244",
            "2024": "-194"
          },
          "reversals": {
            "2025": "-433",
            "2024": "-433"
          },
          "transfer_stage1": {
            "2025": "0",
            "2024": "0"
          },
          "transfer_stage2": {
            "2025": "0",
            "2024": "0"
          },
          "transfer_stage3": {
            "2025": "0",
            "2024": "0"
          },
          "fx_other": {
            "2025": "-57",
            "2024": "23"
          },
          "closing": {
            "2025": "1003",
            "2024": "1105"
          }
        },
        "row_period_roles": {
          "opening": "opening_stock",
          "additions": "annual_flow",
          "remeasurement": "annual_flow",
          "utilization": "annual_flow",
          "reversals": "annual_flow",
          "transfer_stage1": "annual_flow",
          "transfer_stage2": "annual_flow",
          "transfer_stage3": "annual_flow",
          "fx_other": "annual_flow",
          "closing": "closing_stock"
        }
      },
      "ecl_stage1": {
        "source_physical_pages": [
          3548
        ],
        "source_report_pages": [
          308
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "opening_closing_stock_bridge",
        "entity_scope": "financial_services_receivables_including_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening": {
            "2025": "297",
            "2024": "329"
          },
          "additions": {
            "2025": "107",
            "2024": "132"
          },
          "remeasurement": {
            "2025": "-33",
            "2024": "-36"
          },
          "utilization": {
            "2025": "-3",
            "2024": "-4"
          },
          "reversals": {
            "2025": "-134",
            "2024": "-140"
          },
          "transfer_stage1": {
            "2025": "77",
            "2024": "60"
          },
          "transfer_stage2": {
            "2025": "-29",
            "2024": "-33"
          },
          "transfer_stage3": {
            "2025": "-3",
            "2024": "-3"
          },
          "fx_other": {
            "2025": "-15",
            "2024": "-8"
          },
          "closing": {
            "2025": "264",
            "2024": "297"
          }
        },
        "row_period_roles": {
          "opening": "opening_stock",
          "additions": "annual_flow",
          "remeasurement": "annual_flow",
          "utilization": "annual_flow",
          "reversals": "annual_flow",
          "transfer_stage1": "annual_flow",
          "transfer_stage2": "annual_flow",
          "transfer_stage3": "annual_flow",
          "fx_other": "annual_flow",
          "closing": "closing_stock"
        }
      },
      "ecl_stage2": {
        "source_physical_pages": [
          3548
        ],
        "source_report_pages": [
          308
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "opening_closing_stock_bridge",
        "entity_scope": "financial_services_receivables_including_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening": {
            "2025": "244",
            "2024": "240"
          },
          "additions": {
            "2025": "44",
            "2024": "54"
          },
          "remeasurement": {
            "2025": "116",
            "2024": "90"
          },
          "utilization": {
            "2025": "-33",
            "2024": "-36"
          },
          "reversals": {
            "2025": "-77",
            "2024": "-88"
          },
          "transfer_stage1": {
            "2025": "-60",
            "2024": "-46"
          },
          "transfer_stage2": {
            "2025": "47",
            "2024": "50"
          },
          "transfer_stage3": {
            "2025": "-35",
            "2024": "-45"
          },
          "fx_other": {
            "2025": "-18",
            "2024": "25"
          },
          "closing": {
            "2025": "228",
            "2024": "244"
          }
        },
        "row_period_roles": {
          "opening": "opening_stock",
          "additions": "annual_flow",
          "remeasurement": "annual_flow",
          "utilization": "annual_flow",
          "reversals": "annual_flow",
          "transfer_stage1": "annual_flow",
          "transfer_stage2": "annual_flow",
          "transfer_stage3": "annual_flow",
          "fx_other": "annual_flow",
          "closing": "closing_stock"
        }
      },
      "ecl_stage3": {
        "source_physical_pages": [
          3548
        ],
        "source_report_pages": [
          308
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "opening_closing_stock_bridge",
        "entity_scope": "financial_services_receivables_including_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "opening": {
            "2025": "564",
            "2024": "486"
          },
          "additions": {
            "2025": "93",
            "2024": "107"
          },
          "remeasurement": {
            "2025": "305",
            "2024": "307"
          },
          "utilization": {
            "2025": "-208",
            "2024": "-154"
          },
          "reversals": {
            "2025": "-222",
            "2024": "-205"
          },
          "transfer_stage1": {
            "2025": "-17",
            "2024": "-14"
          },
          "transfer_stage2": {
            "2025": "-18",
            "2024": "-17"
          },
          "transfer_stage3": {
            "2025": "38",
            "2024": "48"
          },
          "fx_other": {
            "2025": "-24",
            "2024": "6"
          },
          "closing": {
            "2025": "511",
            "2024": "564"
          }
        },
        "row_period_roles": {
          "opening": "opening_stock",
          "additions": "annual_flow",
          "remeasurement": "annual_flow",
          "utilization": "annual_flow",
          "reversals": "annual_flow",
          "transfer_stage1": "annual_flow",
          "transfer_stage2": "annual_flow",
          "transfer_stage3": "annual_flow",
          "fx_other": "annual_flow",
          "closing": "closing_stock"
        }
      },
      "credit_exposure": {
        "source_physical_pages": [
          3548
        ],
        "source_report_pages": [
          308
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "financial_services_receivables_including_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "stage1": {
            "2025": "68300",
            "2024": "78997"
          },
          "stage2": {
            "2025": "8067",
            "2024": "8569"
          },
          "stage3": {
            "2025": "1355",
            "2024": "1490"
          },
          "gross": {
            "2025": "77722",
            "2024": "89056"
          },
          "not_past_due": {
            "2025": "74094",
            "2024": "85233"
          },
          "past_due_30_or_less": {
            "2025": "1798",
            "2024": "1694"
          },
          "past_due_31_60": {
            "2025": "600",
            "2024": "774"
          },
          "past_due_61_90": {
            "2025": "281",
            "2024": "368"
          },
          "past_due_91_180": {
            "2025": "312",
            "2024": "338"
          },
          "past_due_over180": {
            "2025": "637",
            "2024": "649"
          }
        }
      },
      "segment_revenue": {
        "source_physical_pages": [
          3605
        ],
        "source_report_pages": [
          365
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "segments_before_and_after_intersegment_eliminations",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "cars_external": {
            "2025": "91653",
            "2024": "102483"
          },
          "cars_internal": {
            "2025": "4754",
            "2024": "5278"
          },
          "cars_total": {
            "2025": "96407",
            "2024": "107761"
          },
          "vans_external": {
            "2025": "16724",
            "2024": "18612"
          },
          "vans_internal": {
            "2025": "424",
            "2024": "708"
          },
          "vans_total": {
            "2025": "17148",
            "2024": "19320"
          },
          "fs_external": {
            "2025": "23837",
            "2024": "24499"
          },
          "fs_internal": {
            "2025": "788",
            "2024": "584"
          },
          "fs_total": {
            "2025": "24625",
            "2024": "25083"
          },
          "segments_total": {
            "2025": "138180",
            "2024": "152164"
          },
          "eliminations": {
            "2025": "-5966",
            "2024": "-6570"
          },
          "group": {
            "2025": "132214",
            "2024": "145594"
          }
        }
      },
      "segment_ebit": {
        "source_physical_pages": [
          3605,
          3606
        ],
        "source_report_pages": [
          365,
          366
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "segments_with_corporate_reconciliation",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "cars": {
            "2025": "3564",
            "2024": "8460"
          },
          "vans": {
            "2025": "1309",
            "2024": "2932"
          },
          "fs": {
            "2025": "690",
            "2024": "1134"
          },
          "segments": {
            "2025": "5563",
            "2024": "12526"
          },
          "reconciliation": {
            "2025": "257",
            "2024": "1073"
          },
          "reconciliation_equity_method": {
            "2025": "326",
            "2024": "686"
          },
          "reconciliation_other": {
            "2025": "-195",
            "2024": "197"
          },
          "reconciliation_eliminations": {
            "2025": "126",
            "2024": "190"
          },
          "group": {
            "2025": "5820",
            "2024": "13599"
          }
        }
      },
      "segment_assets_bridge": {
        "source_physical_pages": [
          3606
        ],
        "source_report_pages": [
          366
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "segments_with_unallocated_and_eliminations",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "segments": {
            "2025": "240554",
            "2024": "253026"
          },
          "daimler_truck": {
            "2025": "8221",
            "2024": "8655"
          },
          "other_equity_method": {
            "2025": "173",
            "2024": "227"
          },
          "income_tax": {
            "2025": "6304",
            "2024": "3867"
          },
          "other_eliminations": {
            "2025": "-21159",
            "2024": "-21339"
          },
          "segment_assets_group": {
            "2025": "234093",
            "2024": "244436"
          },
          "unallocated": {
            "2025": "21373",
            "2024": "20574"
          },
          "group_assets": {
            "2025": "255466",
            "2024": "265010"
          }
        }
      },
      "segment_liabilities_bridge": {
        "source_physical_pages": [
          3606
        ],
        "source_report_pages": [
          366
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "segments_with_unallocated_and_eliminations",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "segments": {
            "2025": "187347",
            "2024": "196675"
          },
          "income_tax": {
            "2025": "9952",
            "2024": "7827"
          },
          "other_eliminations": {
            "2025": "-21353",
            "2024": "-21563"
          },
          "segment_liabilities_group": {
            "2025": "175946",
            "2024": "182939"
          },
          "unallocated": {
            "2025": "-14720",
            "2024": "-11559"
          },
          "equity": {
            "2025": "94240",
            "2024": "93630"
          },
          "group_equity_liabilities": {
            "2025": "255466",
            "2024": "265010"
          }
        }
      },
      "regional_revenue": {
        "source_physical_pages": [
          3607
        ],
        "source_report_pages": [
          367
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_flow",
        "entity_scope": "consolidated_group_by_customer_location",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "europe": {
            "2025": "57908",
            "2024": "58764"
          },
          "germany_of_europe": {
            "2025": "20943",
            "2024": "21707"
          },
          "north_america": {
            "2025": "34552",
            "2024": "38917"
          },
          "us_of_north_america": {
            "2025": "30974",
            "2024": "34900"
          },
          "asia": {
            "2025": "31571",
            "2024": "39643"
          },
          "china_of_asia": {
            "2025": "16519",
            "2024": "23139"
          },
          "other": {
            "2025": "8183",
            "2024": "8270"
          },
          "total": {
            "2025": "132214",
            "2024": "145594"
          }
        }
      },
      "net_assets_average": {
        "source_physical_pages": [
          3608
        ],
        "source_report_pages": [
          368
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "annual_average_stock",
        "entity_scope": "capital_management_not_closing_balance_sheet_equity",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "cars": {
            "2025": "39404",
            "2024": "41905"
          },
          "vans": {
            "2025": "1454",
            "2024": "1632"
          },
          "fs_equity": {
            "2025": "13002",
            "2024": "12993"
          },
          "segments": {
            "2025": "53860",
            "2024": "56530"
          },
          "daimler_truck": {
            "2025": "8312",
            "2024": "8466"
          },
          "other_equity_method": {
            "2025": "182",
            "2024": "230"
          },
          "income_tax": {
            "2025": "-4273",
            "2024": "-4717"
          },
          "other_eliminations": {
            "2025": "246",
            "2024": "-19"
          },
          "group": {
            "2025": "58327",
            "2024": "60490"
          }
        },
        "row_period_roles": {
          "cars": "annual_average_stock",
          "vans": "annual_average_stock",
          "fs_equity": "annual_average_stock",
          "segments": "annual_average_stock",
          "daimler_truck": "annual_average_stock",
          "other_equity_method": "annual_average_stock",
          "income_tax": "annual_average_stock",
          "other_eliminations": "annual_average_stock",
          "group": "annual_average_stock"
        }
      },
      "eps": {
        "source_physical_pages": [
          3492,
          3609
        ],
        "source_report_pages": [
          252,
          369
        ],
        "currency": "EUR",
        "unit": "EUR per share",
        "decimal_places": 2,
        "period_kind": "annual_flow",
        "entity_scope": "attributable_to_parent_shareholders",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "basic": {
            "2025": "5.34",
            "2024": "10.19"
          },
          "diluted": {
            "2025": "5.34",
            "2024": "10.19"
          }
        }
      },
      "weighted_shares": {
        "source_physical_pages": [
          3609
        ],
        "source_report_pages": [
          369
        ],
        "currency": null,
        "unit": "million shares",
        "decimal_places": 1,
        "period_kind": "annual_weighted_average_stock",
        "entity_scope": "parent_shares_outstanding_not_year_end_shares",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "basic": {
            "2025": "962.4",
            "2024": "1002.0"
          },
          "diluted": {
            "2025": "962.4",
            "2024": "1002.0"
          }
        },
        "row_period_roles": {
          "basic": "annual_weighted_average_stock",
          "diluted": "annual_weighted_average_stock"
        }
      },
      "pension_funding": {
        "source_physical_pages": [
          3559
        ],
        "source_report_pages": [
          319
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "defined_benefit_pensions_excluding_post_employment_healthcare",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "obligation": {
            "2025": "20188",
            "2024": "21599"
          },
          "plan_assets": {
            "2025": "22828",
            "2024": "22550"
          },
          "funded_status": {
            "2025": "2640",
            "2024": "951"
          },
          "asset_ceiling": {
            "2025": "-19",
            "2024": "-13"
          },
          "net_balance": {
            "2025": "2621",
            "2024": "938"
          },
          "asset": {
            "2025": "3131",
            "2024": "1553"
          },
          "liability": {
            "2025": "-510",
            "2024": "-615"
          }
        }
      },
      "risk_provisions": {
        "source_physical_pages": [
          3565
        ],
        "source_report_pages": [
          325
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_group",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "warranty": {
            "2025": "7091",
            "2024": "6934"
          },
          "personnel": {
            "2025": "3762",
            "2024": "4198"
          },
          "litigation": {
            "2025": "1891",
            "2024": "1683"
          },
          "other": {
            "2025": "2714",
            "2024": "2205"
          },
          "total": {
            "2025": "15458",
            "2024": "15020"
          },
          "current": {
            "2025": "7846",
            "2024": "7688"
          },
          "noncurrent": {
            "2025": "7612",
            "2024": "7332"
          }
        }
      },
      "financing_debt": {
        "source_physical_pages": [
          3566
        ],
        "source_report_pages": [
          326
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_balance_sheet_excluding_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "bonds": {
            "2025": "54862",
            "2024": "62886"
          },
          "commercial_paper": {
            "2025": "101",
            "2024": "952"
          },
          "banks": {
            "2025": "24427",
            "2024": "26315"
          },
          "deposits": {
            "2025": "1562",
            "2024": "1557"
          },
          "abs": {
            "2025": "16177",
            "2024": "18199"
          },
          "leases": {
            "2025": "1989",
            "2024": "2233"
          },
          "other": {
            "2025": "888",
            "2024": "656"
          },
          "current": {
            "2025": "37596",
            "2024": "39311"
          },
          "noncurrent": {
            "2025": "62410",
            "2024": "73487"
          },
          "total": {
            "2025": "100006",
            "2024": "112798"
          }
        }
      },
      "financial_instruments": {
        "source_physical_pages": [
          3575,
          3577
        ],
        "source_report_pages": [
          335,
          337
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "financial_instruments_including_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "fs_carrying": {
            "2025": "76719",
            "2024": "87950"
          },
          "fs_fair_value": {
            "2025": "78487",
            "2024": "90048"
          },
          "trade_carrying": {
            "2025": "5893",
            "2024": "6982"
          },
          "cash": {
            "2025": "12276",
            "2024": "14517"
          },
          "financing_carrying": {
            "2025": "98486",
            "2024": "110583"
          },
          "financing_fair_value": {
            "2025": "98529",
            "2024": "110095"
          },
          "asset_total_carrying": {
            "2025": "108161",
            "2024": "122724"
          },
          "asset_total_fair_value": {
            "2025": "109929",
            "2024": "124822"
          },
          "liability_total_carrying": {
            "2025": "119572",
            "2024": "132116"
          },
          "liability_total_fair_value": {
            "2025": "119615",
            "2024": "131628"
          }
        }
      },
      "fair_value_hierarchy": {
        "source_physical_pages": [
          3579
        ],
        "source_report_pages": [
          339
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "recognized_at_fair_value_excluding_amortized_cost_disclosure_only_fair_values",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "assets_level1": {
            "2025": "7617",
            "2024": "7096"
          },
          "assets_level2": {
            "2025": "2055",
            "2024": "1889"
          },
          "assets_level3": {
            "2025": "1041",
            "2024": "702"
          },
          "assets_total": {
            "2025": "10713",
            "2024": "9687"
          },
          "liabilities_level1": {
            "2025": "0",
            "2024": "0"
          },
          "liabilities_level2": {
            "2025": "447",
            "2024": "1232"
          },
          "liabilities_level3": {
            "2025": "0",
            "2024": "0"
          },
          "liabilities_total": {
            "2025": "447",
            "2024": "1232"
          }
        }
      },
      "derivative_netting": {
        "source_physical_pages": [
          3578
        ],
        "source_report_pages": [
          338
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "derivatives_gross_recognized_and_hypothetical_default_netting",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "asset_gross_recognized": {
            "2025": "2032",
            "2024": "1562"
          },
          "liability_gross_recognized": {
            "2025": "447",
            "2024": "1232"
          },
          "potential_offset": {
            "2025": "-317",
            "2024": "-888"
          },
          "asset_hypothetical_net": {
            "2025": "1715",
            "2024": "674"
          },
          "liability_hypothetical_net": {
            "2025": "130",
            "2024": "344"
          }
        }
      },
      "contract_refund": {
        "source_physical_pages": [
          3568
        ],
        "source_report_pages": [
          328
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_stock",
        "entity_scope": "consolidated_group_excluding_held_for_sale",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "service": {
            "2025": "4118",
            "2024": "4275"
          },
          "other_contract": {
            "2025": "2071",
            "2024": "1926"
          },
          "contract_total": {
            "2025": "6189",
            "2024": "6201"
          },
          "sales_refund": {
            "2025": "4379",
            "2024": "4655"
          },
          "other_refund": {
            "2025": "329",
            "2024": "390"
          },
          "refund_total": {
            "2025": "4708",
            "2024": "5045"
          },
          "total": {
            "2025": "10897",
            "2024": "11246"
          },
          "current": {
            "2025": "7955",
            "2024": "8146"
          },
          "noncurrent": {
            "2025": "2942",
            "2024": "3100"
          }
        }
      },
      "contingencies": {
        "source_physical_pages": [
          3574
        ],
        "source_report_pages": [
          334
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "closing_maximum_or_best_estimate_off_balance_sheet",
        "entity_scope": "unrecognized_contingent_obligations_not_booked_liabilities",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "legal": {
            "2025": "2147",
            "2024": "2333"
          },
          "jv_support": {
            "2025": "622",
            "2024": "0"
          },
          "warranty": {
            "2025": "318",
            "2024": "319"
          },
          "other": {
            "2025": "69",
            "2024": "155"
          },
          "total": {
            "2025": "3156",
            "2024": "2807"
          },
          "purchase_commitments": {
            "2025": "6282",
            "2024": "6572"
          }
        }
      },
      "liquidity_runoff": {
        "source_physical_pages": [
          3596,
          3597
        ],
        "source_report_pages": [
          356,
          357
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "future_contractual_undiscounted_cashflows",
        "entity_scope": "recognized_liability_contractual_cashflows_plus_maximum_undrawn_commitments_and_guarantees",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "financing": {
            "2025": "108373",
            "2024": "122698"
          },
          "derivatives": {
            "2025": "383",
            "2024": "1409"
          },
          "trade": {
            "2025": "10665",
            "2024": "11312"
          },
          "other_financial": {
            "2025": "5059",
            "2024": "4322"
          },
          "sales_obligations": {
            "2025": "4379",
            "2024": "4655"
          },
          "loan_commitments": {
            "2025": "2289",
            "2024": "2635"
          },
          "guarantees": {
            "2025": "384",
            "2024": "139"
          },
          "total": {
            "2025": "131532",
            "2024": "147170"
          },
          "year1": {
            "2025": "62279",
            "2024": "64907"
          },
          "year2": {
            "2025": "28848",
            "2024": "31633"
          },
          "year3": {
            "2025": "14411",
            "2024": "20976"
          },
          "year4": {
            "2025": "7098",
            "2024": "6608"
          },
          "year5": {
            "2025": "6476",
            "2024": "6419"
          },
          "later": {
            "2025": "12420",
            "2024": "16627"
          }
        },
        "calendar_bands": {
          "2025": [
            "2026",
            "2027",
            "2028",
            "2029",
            "2030",
            ">=2031"
          ],
          "2024": [
            "2025",
            "2026",
            "2027",
            "2028",
            "2029",
            ">=2030"
          ]
        }
      },
      "daimler_truck_associate_income": {
        "source_physical_pages": [
          3544
        ],
        "source_report_pages": [
          304
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "mixed_duration_flow",
        "entity_scope": "associate_own_IFRS_information_not_Mercedes_consolidated_revenue",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-09-30",
            "months": 9
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31",
            "months": 12
          }
        },
        "rows": {
          "revenue": {
            "2025": "33733",
            "2024": "54077"
          },
          "continuing_profit": {
            "2025": "1401",
            "2024": "3066"
          },
          "discontinued_profit": {
            "2025": "166",
            "2024": "0"
          },
          "oci": {
            "2025": "-643",
            "2024": "-173"
          },
          "comprehensive": {
            "2025": "924",
            "2024": "2893"
          }
        },
        "direct_growth_comparison_allowed": false
      },
      "daimler_truck_associate_assets": {
        "source_physical_pages": [
          3544
        ],
        "source_report_pages": [
          304
        ],
        "currency": "EUR",
        "unit": "EUR million",
        "decimal_places": 0,
        "period_kind": "mixed_as_of_stock",
        "entity_scope": "associate_own_IFRS_information_with_investor_adjustments",
        "standard": "IFRS as adopted by EU plus German HGB 315e",
        "periods": {
          "2025": {
            "as_of": "2025-09-30"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "noncurrent_assets": {
            "2025": "36162",
            "2024": "40794"
          },
          "current_assets": {
            "2025": "40351",
            "2024": "38455"
          },
          "noncurrent_liabilities": {
            "2025": "30681",
            "2024": "27533"
          },
          "current_liabilities": {
            "2025": "19801",
            "2024": "23617"
          },
          "equity": {
            "2025": "26031",
            "2024": "28099"
          }
        },
        "direct_same_year_end_comparison_allowed": false
      }
    },
    "assurance": {
      "financial_statement_audit": {
        "auditor": "PricewaterhouseCoopers GmbH Wirtschaftsprüfungsgesellschaft",
        "opinion": "unmodified",
        "scope": "consolidated_FY2025_financial_statements_and_Group_management_report_subject_to_exclusions",
        "year_end": "2025-12-31",
        "report_date": "2026-03-03",
        "source_physical_pages": [
          3630,
          3631,
          3634,
          3635,
          3636,
          3639
        ],
        "separate_icfr_effectiveness_opinion": false,
        "separate_KAM_opinions": false,
        "whole_annual_report_assured": false
      },
      "sustainability": {
        "overall_level": "limited",
        "reasonable_assurance_only": [
          "starred_total_employees",
          "starred_top_management_gender_absolute",
          "starred_europe_vehicle_CO2",
          "starred_US_vehicle_GHG",
          "starred_China_imported_car_fleet_consumption"
        ],
        "source_physical_pages": [
          3640,
          3641,
          3642,
          3643,
          3644
        ],
        "control_effectiveness_opinion": false
      },
      "esef": {
        "scope": "conversion_only_of_named_German_ESEF_file",
        "covers_this_corpus_PDF_as_ESEF": false,
        "source_physical_pages": [
          3637,
          3638,
          3639
        ]
      }
    },
    "scope_warnings": [
      "Parent-company HGB condensed statements (physical3343–3345) are separate from consolidated IFRS.",
      "Amounts are reported figures; no adjusted earnings should substitute for IFRS EBIT.",
      "Source rounded integers can cause small arithmetic residuals; reported exact source anchors remain authoritative.",
      "ECL stage table includes held-for-sale assets; balance-sheet receivables table excludes them.",
      "Note14 prior finance-lease comparative reclassifies3355 EURm from unguaranteed residual values into contractual payments.",
      "This model covers selected statements and notes, not every report disclosure.",
      "Note13 Daimler Truck2025 income covers9months and asset figuresSeptember30;2024 is annual/December31. Do not compute annual growth from this table.",
      "Financial instruments note31 prior cash14517 EURm differs from cash-flow closing14516 EURm; preserve both reported anchors and record1m presentation difference without inventing a correction.",
      "Note32 prior FS maximum exposure87867 EURm differs note31 carrying87950 EURm despite both tables describing Group amounts including HFS; unresolved source/scope question."
    ]
  },
  "narrative": {
    "schema": "mercedes-narrative-reference-v1",
    "company": "Mercedes-Benz Group",
    "report_year": 2025,
    "source_pdf_sha256": "8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802",
    "purpose": "Selected source-specific quantitative narrative reference; not an audit or general validation engine",
    "tables": {
      "cars_unit_sales": {
        "source_physical_page": 3288,
        "source_report_page": 48,
        "source_text_sha256": "3c418685306444cba5e4e18f8d6ecb236fb9f3d9df28d0264b6d9270a2711b90",
        "entity_scope": "Mercedes-Benz Cars unit-sales perimeter including equity-accounted BBAC and non-consolidated subsidiaries",
        "unit": "vehicles",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "total": {
            "2025": "1801291",
            "2024": "1983403"
          },
          "top_end": {
            "2025": "268026",
            "2024": "281492"
          },
          "s_class": {
            "2025": "105564",
            "2024": "127073"
          },
          "amg": {
            "2025": "142319",
            "2024": "140282"
          },
          "g_class": {
            "2025": "48214",
            "2024": "42260"
          },
          "maybach": {
            "2025": "20033",
            "2024": "21302"
          },
          "core": {
            "2025": "1049830",
            "2024": "1167119"
          },
          "e_class": {
            "2025": "461201",
            "2024": "512143"
          },
          "c_class": {
            "2025": "667063",
            "2024": "725129"
          },
          "entry": {
            "2025": "483435",
            "2024": "534792"
          },
          "b_class": {
            "2025": "152185",
            "2024": "183772"
          },
          "a_class": {
            "2025": "354795",
            "2024": "374033"
          },
          "smart": {
            "2025": "40",
            "2024": "5696"
          },
          "xev": {
            "2025": "368700",
            "2024": "367610"
          },
          "bev": {
            "2025": "168823",
            "2024": "185059"
          },
          "phev": {
            "2025": "199877",
            "2024": "182551"
          }
        },
        "source_notes": [
          "Unit sales include invoices for new vehicles to non-Group third parties, including non-Group dealers and non-consolidated subsidiaries, plus new-vehicle lease contracts including finance leases.",
          "BBAC sales are included although its financial contribution is equity accounted.",
          "S-Class, G-Class, E-Class, C-Class, B-Class and A-Class rows include AMG models and derivatives; S-Class also includes Maybach variants.",
          "Only Top-End, Core and Entry form the mutually exclusive product-category partition. Brand and class rows overlap.",
          "xEV is BEV plus PHEV, and is a subset of total sales."
        ],
        "mutually_exclusive_partition": [
          "top_end",
          "core",
          "entry"
        ],
        "subset_partition": {
          "xev": [
            "bev",
            "phev"
          ]
        }
      },
      "cars_regional_sales": {
        "source_physical_page": 3289,
        "source_report_page": 49,
        "source_text_sha256": "05b1057983a96c15db81e46da1ac0ed1f4bf8733cc0d2e7dda66b5e886a7201e",
        "entity_scope": "Same Cars unit-sales perimeter as cars_unit_sales",
        "unit": "vehicles",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "total": {
            "2025": "1801291",
            "2024": "1983403"
          },
          "europe": {
            "2025": "635072",
            "2024": "641792"
          },
          "germany": {
            "2025": "213672",
            "2024": "213456"
          },
          "north_america": {
            "2025": "320552",
            "2024": "365358"
          },
          "united_states": {
            "2025": "284650",
            "2024": "324529"
          },
          "asia": {
            "2025": "746981",
            "2024": "892147"
          },
          "china": {
            "2025": "551932",
            "2024": "683568"
          },
          "other": {
            "2025": "98686",
            "2024": "84106"
          }
        },
        "source_notes": [
          "Europe is EU, UK, Switzerland and Norway. North America is US, Canada and Mexico.",
          "Germany, US and China are thereof subsets; do not add them to regional totals. China includes BBAC."
        ],
        "mutually_exclusive_partition": [
          "europe",
          "north_america",
          "asia",
          "other"
        ],
        "subsets": {
          "germany": "europe",
          "united_states": "north_america",
          "china": "asia"
        }
      },
      "vans_customer_sales": {
        "source_physical_page": 3289,
        "source_report_page": 49,
        "source_text_sha256": "05b1057983a96c15db81e46da1ac0ed1f4bf8733cc0d2e7dda66b5e886a7201e",
        "entity_scope": "Mercedes-Benz Vans sales perimeter including joint venture FBAC and licensee Prestige Auto",
        "unit": "vehicles",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "total": {
            "2025": "359136",
            "2024": "405610"
          },
          "commercial": {
            "2025": "298655",
            "2024": "343683"
          },
          "commercial_large": {
            "2025": "188889",
            "2024": "219127"
          },
          "commercial_mid": {
            "2025": "86834",
            "2024": "101205"
          },
          "commercial_small": {
            "2025": "22932",
            "2024": "23351"
          },
          "private": {
            "2025": "60481",
            "2024": "61926"
          },
          "private_mid": {
            "2025": "53730",
            "2024": "56809"
          },
          "private_small": {
            "2025": "6751",
            "2024": "5117"
          },
          "xev": {
            "2025": "28488",
            "2024": "19516"
          }
        },
        "source_notes": [
          "Unit-sales invoice/lease definition includes non-consolidated subsidiaries, FBAC and Prestige Auto.",
          "Vans xEVs are exclusively BEVs. This differs from the Cars xEV composition.",
          "Commercial and private partition total; each customer segment has its own size partition."
        ],
        "mutually_exclusive_partition": [
          "commercial",
          "private"
        ],
        "subset_partition": {
          "commercial": [
            "commercial_large",
            "commercial_mid",
            "commercial_small"
          ],
          "private": [
            "private_mid",
            "private_small"
          ]
        },
        "known_reported_residuals": {
          "2024_total_minus_commercial_and_private": "1 vehicle; independently visually checked; no source correction or rounding explanation assumed"
        }
      },
      "vans_regional_sales": {
        "source_physical_page": 3290,
        "source_report_page": 50,
        "source_text_sha256": "d920b78a0c68c26721dedeb6894576b8747a6face63450f55d5906c94d2ad88c",
        "entity_scope": "Same Vans unit-sales perimeter as vans_customer_sales",
        "unit": "vehicles",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "total": {
            "2025": "359136",
            "2024": "405610"
          },
          "europe": {
            "2025": "248744",
            "2024": "271500"
          },
          "germany": {
            "2025": "102705",
            "2024": "103247"
          },
          "north_america": {
            "2025": "43410",
            "2024": "59953"
          },
          "united_states": {
            "2025": "35327",
            "2024": "49538"
          },
          "asia": {
            "2025": "28261",
            "2024": "33993"
          },
          "china": {
            "2025": "20006",
            "2024": "26613"
          },
          "other": {
            "2025": "38721",
            "2024": "40164"
          }
        },
        "source_notes": [
          "Regional definitions match the Cars geographic table. Country rows are subsets.",
          "Prestige Auto licensed vehicles continue to be included after subsidiary disposal."
        ],
        "mutually_exclusive_partition": [
          "europe",
          "north_america",
          "asia",
          "other"
        ],
        "subsets": {
          "germany": "europe",
          "united_states": "north_america",
          "china": "asia"
        }
      },
      "xev_share": {
        "source_physical_page": 3288,
        "source_report_page": 48,
        "source_text_sha256": "3c418685306444cba5e4e18f8d6ecb236fb9f3d9df28d0264b6d9270a2711b90",
        "entity_scope": "Segment-specific unit-sales perimeter; Vans values from physical3289",
        "unit": "percent",
        "period_kind": "annual_ratio",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "cars": {
            "2025": "20.5",
            "2024": "18.5"
          },
          "vans": {
            "2025": "7.9",
            "2024": "4.8"
          }
        },
        "source_notes": [
          "Reported shares are rounded to one decimal place.",
          "Cars includes BEVs and PHEVs; Vans comprises exclusively BEVs."
        ],
        "additional_source_pages": [
          3289
        ],
        "decimal_places": 1
      },
      "research_development": {
        "source_physical_page": 3310,
        "source_report_page": 70,
        "source_text_sha256": "385d8ca055434d579dc36ba4670b2d78c3d26ba1b9df6a6afe853d50486e7cad",
        "entity_scope": "Consolidated Group; Cars and Vans are disclosed thereof rows before reconciliation",
        "unit": "EUR million",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "group_expenditure": {
            "2025": "9680",
            "2024": "9717"
          },
          "cars_expenditure": {
            "2025": "8585",
            "2024": "8744"
          },
          "vans_expenditure": {
            "2025": "1129",
            "2024": "1012"
          },
          "expensed": {
            "2025": "6055",
            "2024": "5580"
          },
          "capitalized": {
            "2025": "3625",
            "2024": "4137"
          }
        },
        "source_notes": [
          "Group expenditure equals expensed research and non-capitalized development plus capitalized development.",
          "Cars plus Vans does not equal Group; do not treat thereof segment rows as an exhaustive additive set.",
          "Capitalized annual flow is distinct from balance-sheet carrying amount of capitalized development."
        ]
      },
      "ppe_investment": {
        "source_physical_page": 3310,
        "source_report_page": 70,
        "source_text_sha256": "385d8ca055434d579dc36ba4670b2d78c3d26ba1b9df6a6afe853d50486e7cad",
        "entity_scope": "Consolidated Group; automotive segments are disclosed thereof rows",
        "unit": "EUR million",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "group": {
            "2025": "5482",
            "2024": "4039"
          },
          "cars": {
            "2025": "4074",
            "2024": "3392"
          },
          "vans": {
            "2025": "1233",
            "2024": "571"
          }
        },
        "source_notes": [
          "Investment corresponds to PPE additions in the Consolidated Statement of Cash Flows.",
          "Cars and Vans are not an exhaustive partition of the Group."
        ]
      },
      "parent_hgb_profit": {
        "source_physical_page": 3343,
        "source_report_page": 103,
        "source_text_sha256": "c6b5e9a13a7a949d71ae90c9827fd7849495fa39f68a7a53795740d12b81d7fd",
        "entity_scope": "Mercedes-Benz Group AG standalone legal entity, HGB and AktG",
        "unit": "EUR million",
        "period_kind": "annual_flow",
        "periods": {
          "2025": {
            "start": "2025-01-01",
            "end": "2025-12-31"
          },
          "2024": {
            "start": "2024-01-01",
            "end": "2024-12-31"
          }
        },
        "rows": {
          "revenue": {
            "2025": "1325",
            "2024": "1395"
          },
          "cost_sales": {
            "2025": "-1310",
            "2024": "-1382"
          },
          "administration": {
            "2025": "-770",
            "2024": "-644"
          },
          "other_operating": {
            "2025": "25",
            "2024": "68"
          },
          "operating_profit": {
            "2025": "-730",
            "2024": "-563"
          },
          "financial_income": {
            "2025": "2000",
            "2024": "10584"
          },
          "tax": {
            "2025": "264",
            "2024": "-1449"
          },
          "net_profit": {
            "2025": "1534",
            "2024": "8572"
          },
          "retained_earnings_movement": {
            "2025": "1817",
            "2024": "-4286"
          },
          "cancel_open_treasury_deduction": {
            "2025": "0",
            "2024": "-83"
          },
          "treasury_acquisition_cancellation": {
            "2025": "0",
            "2024": "-4916"
          },
          "retained_earnings_offset": {
            "2025": "0",
            "2024": "4999"
          },
          "distributable_profit": {
            "2025": "3351",
            "2024": "4286"
          }
        },
        "source_notes": [
          "The source presents dashes for three 2025 treasury-related movements; numeric zero is an explicit arithmetic interpretation in this selected model, with the original dash retained below.",
          "2025 retained-earnings movement is a withdrawal; 2024 is a transfer into retained earnings.",
          "Parent net profit and distributable profit are not Group IFRS net income."
        ],
        "source_dash_cells": [
          "cancel_open_treasury_deduction.2025",
          "treasury_acquisition_cancellation.2025",
          "retained_earnings_offset.2025"
        ],
        "row_measurement_roles": {
          "net_profit": "Annual financial-year profit before appropriation",
          "distributable_profit": "After-appropriation result in the annual statement, not an ordinary operating flow",
          "retained_earnings_movement": "Appropriation movement",
          "cancel_open_treasury_deduction": "Equity appropriation adjustment",
          "treasury_acquisition_cancellation": "Equity appropriation adjustment",
          "retained_earnings_offset": "Equity appropriation adjustment"
        }
      },
      "parent_hgb_balance": {
        "source_physical_page": 3344,
        "source_report_page": 104,
        "source_text_sha256": "4b21096ea281034c9a745836b2092a71d532aafa2db66d08961af1a3b48c9519",
        "entity_scope": "Mercedes-Benz Group AG standalone legal entity, HGB and AktG",
        "unit": "EUR million",
        "period_kind": "closing_stock",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "noncurrent_assets": {
            "2025": "39516",
            "2024": "39637"
          },
          "receivables_securities_other": {
            "2025": "19890",
            "2024": "29719"
          },
          "cash": {
            "2025": "6974",
            "2024": "6552"
          },
          "current_assets": {
            "2025": "26864",
            "2024": "36271"
          },
          "prepaid": {
            "2025": "179",
            "2024": "189"
          },
          "assets": {
            "2025": "66559",
            "2024": "76097"
          },
          "share_capital": {
            "2025": "3070",
            "2024": "3070"
          },
          "treasury_calculated_value": {
            "2025": "-18",
            "2024": "0"
          },
          "capital_reserve": {
            "2025": "11480",
            "2024": "11480"
          },
          "retained_earnings": {
            "2025": "18974",
            "2024": "20956"
          },
          "distributable_profit": {
            "2025": "3351",
            "2024": "4286"
          },
          "equity": {
            "2025": "36857",
            "2024": "39792"
          },
          "pension_provisions": {
            "2025": "224",
            "2024": "256"
          },
          "other_provisions": {
            "2025": "1630",
            "2024": "1833"
          },
          "provisions": {
            "2025": "1854",
            "2024": "2089"
          },
          "bonds_commercial_paper": {
            "2025": "11089",
            "2024": "11041"
          },
          "other_liabilities": {
            "2025": "16759",
            "2024": "23175"
          },
          "liabilities": {
            "2025": "27848",
            "2024": "34216"
          },
          "equity_liabilities": {
            "2025": "66559",
            "2024": "76097"
          }
        },
        "source_notes": [
          "2024 treasury calculated value is shown as dash, represented as zero solely for the arithmetic bridge.",
          "Parent cash, equity and assets must not be substituted into Group or industrial-business ratios."
        ],
        "source_dash_cells": [
          "treasury_calculated_value.2024"
        ]
      },
      "board_gender": {
        "source_physical_page": 3349,
        "source_report_page": 109,
        "source_text_sha256": "1e4d4bda840a798622fedd6bb5aeb100c8c734b36a7761a8f58465285f3d7167",
        "entity_scope": "Mercedes-Benz Group AG Board of Management and Supervisory Board",
        "unit": "percent",
        "period_kind": "point_in_time_ratio",
        "periods": {
          "2025": {
            "as_of": "2025-12-31"
          },
          "2024": {
            "as_of": "2024-12-31"
          }
        },
        "rows": {
          "management_men": {
            "2025": "87.5",
            "2024": "62.5"
          },
          "management_women": {
            "2025": "12.5",
            "2024": "37.5"
          },
          "supervisory_men": {
            "2025": "55",
            "2024": "60"
          },
          "supervisory_women": {
            "2025": "45",
            "2024": "40"
          }
        },
        "source_notes": [
          "Board of Management has eight members; Supervisory Board has twenty.",
          "Age metrics from the same source are intentionally not merged here: the 2024 footnote uses a different threshold and age is at appointment/election, not necessarily reporting date."
        ]
      }
    },
    "assurance": "Analytical transcription and semantic review only. Source assurance must be assigned by the actual assurance report and the precise disclosed category, not inherited from a document-wide label.",
    "forecast_comparative_bands": {
      "source_physical_page": 3324,
      "source_report_page": 84,
      "measure": "Percentage change versus the previous reporting year",
      "direction": "Above and below carry positive and negative signs; thresholds below use absolute change.",
      "rows": {
        "revenue_and_unit_sales": {
          "flat_max_inclusive": "2",
          "slight_min_exclusive": "2",
          "slight_max_inclusive": "7.5",
          "significant_min_exclusive": "7.5"
        },
        "ebit": {
          "flat_max_inclusive": "5",
          "slight_min_exclusive": "5",
          "slight_max_inclusive": "15",
          "significant_min_exclusive": "15"
        },
        "industrial_fcf": {
          "flat_max_inclusive": "10",
          "slight_min_exclusive": "10",
          "slight_max_inclusive": "25",
          "significant_min_exclusive": "25"
        },
        "ppe_investment_and_rd": {
          "flat_max_inclusive": "2.5",
          "slight_min_exclusive": "2.5",
          "slight_max_inclusive": "10",
          "significant_min_exclusive": "10"
        }
      }
    },
    "forecast_2026": {
      "source_physical_pages": [
        3321,
        3323,
        3324
      ],
      "status": "forecast_not_actual",
      "planning_year": 2026,
      "comparison_year": 2025,
      "tariff_assumptions_as_of": "2026-02-19",
      "scope_exclusions": [
        "Potential M&A effects excluded from Group EBIT and industrial FCF.",
        "Athlon disposal result excluded from Financial Services adjusted ROE."
      ],
      "rows": [
        {
          "scope": "group",
          "metric": "revenue",
          "unit": "EUR million",
          "actual_2025": "132214",
          "forecast": "at_prior_year_level",
          "band_key": "revenue_and_unit_sales"
        },
        {
          "scope": "group",
          "metric": "reported_ebit",
          "unit": "EUR million",
          "actual_2025": "5820",
          "forecast": "significantly_above",
          "band_key": "ebit"
        },
        {
          "scope": "industrial_business",
          "metric": "reported_fcf",
          "unit": "EUR million",
          "actual_2025": "5414",
          "forecast": "slightly_below",
          "band_key": "industrial_fcf"
        },
        {
          "scope": "cars",
          "metric": "unit_sales",
          "unit": "vehicles",
          "actual_2025": "1801291",
          "forecast": "at_prior_year_level",
          "band_key": "revenue_and_unit_sales"
        },
        {
          "scope": "cars",
          "metric": "xev_share",
          "unit": "percent",
          "actual_2025": "20.5",
          "forecast_range": [
            "21",
            "23"
          ]
        },
        {
          "scope": "cars",
          "metric": "adjusted_ros",
          "unit": "percent",
          "actual_2025": "5.0",
          "forecast_range": [
            "3",
            "5"
          ]
        },
        {
          "scope": "cars",
          "metric": "adjusted_cash_conversion",
          "unit": "ratio",
          "actual_2025": "1.2",
          "forecast_range": [
            "1.0",
            "1.2"
          ]
        },
        {
          "scope": "cars",
          "metric": "ppe_investment",
          "unit": "EUR million",
          "actual_2025": "4074",
          "forecast": "slightly_below",
          "band_key": "ppe_investment_and_rd"
        },
        {
          "scope": "cars",
          "metric": "rd_expenditure",
          "unit": "EUR million",
          "actual_2025": "8585",
          "forecast": "significantly_below",
          "band_key": "ppe_investment_and_rd"
        },
        {
          "scope": "vans",
          "metric": "unit_sales",
          "unit": "vehicles",
          "actual_2025": "359136",
          "forecast": "slightly_above",
          "band_key": "revenue_and_unit_sales"
        },
        {
          "scope": "vans",
          "metric": "xev_share",
          "unit": "percent",
          "actual_2025": "7.9",
          "forecast_range": [
            "8",
            "10"
          ]
        },
        {
          "scope": "vans",
          "metric": "adjusted_ros",
          "unit": "percent",
          "actual_2025": "10.2",
          "forecast_range": [
            "8",
            "10"
          ]
        },
        {
          "scope": "vans",
          "metric": "adjusted_cash_conversion",
          "unit": "ratio",
          "actual_2025": "0.6",
          "forecast_range": [
            "0.1",
            "0.3"
          ]
        },
        {
          "scope": "vans",
          "metric": "ppe_investment",
          "unit": "EUR million",
          "actual_2025": "1233",
          "forecast": "significantly_above",
          "band_key": "ppe_investment_and_rd"
        },
        {
          "scope": "vans",
          "metric": "rd_expenditure",
          "unit": "EUR million",
          "actual_2025": "1129",
          "forecast": "slightly_above",
          "band_key": "ppe_investment_and_rd"
        },
        {
          "scope": "financial_services",
          "metric": "adjusted_roe",
          "unit": "percent",
          "actual_2025": "9.7",
          "forecast_range": [
            "10",
            "12"
          ]
        }
      ],
      "numeric_range_endpoint_note": "Source provides reported ranges without expressly specifying mathematical endpoint inclusivity; no additional interpretation is asserted."
    },
    "governance_independence": {
      "source_physical_page": 3349,
      "as_of": "2025-12-31",
      "shareholder_representatives_independent_percent": "100",
      "all_supervisory_members_independent_percent": "50",
      "basis": "The report conservatively does not classify employee representatives as independent under CSRD/ESRS because the interpretation remains unclear; it does not establish that employee representatives are personally conflicted."
    }
  },
  "sustainability": [
    {
      "id": "MB2025-3392-1",
      "physical_page": 3392,
      "printed_page": 152,
      "title": "Emissions to air",
      "unit": "t",
      "scope": "Own locations worldwide",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Dash zinc2025 means no E-PRTR AnnexII threshold exceedance, not zero. VOC direct or indirect site method; other pollutant estimates may use prior-year extrapolation.",
      "rows": [
        {
          "label": "Solvents – VOC",
          "values": {
            "2025": 2913,
            "2024": 3296
          }
        },
        {
          "label": "Nitrogen oxides – NOx",
          "values": {
            "2025": 109,
            "2024": 207
          }
        },
        {
          "label": "Zinc – Zn",
          "values": {
            "2025": "–",
            "2024": 2
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03392.txt"
    },
    {
      "id": "MB2025-3395-2",
      "physical_page": 3395,
      "printed_page": 155,
      "title": "Water consumption in own operations – ESRS",
      "unit": "1000 m3",
      "scope": "Own operations worldwide",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Consumption=withdrawal-discharge, discharge includes irrigation. At-risk includes high stress. Reused2024 restated+2425 (1000m3); measured/invoiced reused-data share23%; extrapolated total. Storage dash means no ESRS storage. Green-space irrigation is deducted in ESRS consumption, not in company supply.",
      "rows": [
        {
          "label": "Water consumption",
          "values": {
            "2025": 2159,
            "2024": 2091
          }
        },
        {
          "label": "Water consumption in areas at water risk",
          "values": {
            "2025": 1051,
            "2024": 994
          }
        },
        {
          "label": "Water recycled and reused",
          "values": {
            "2025": 2488,
            "2024": 2571
          }
        },
        {
          "label": "Water stored",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03395.txt"
    },
    {
      "id": "MB2025-3395-3",
      "physical_page": 3395,
      "printed_page": 155,
      "title": "Water consumption per net revenue – ESRS",
      "unit": "m3/EUR million",
      "scope": "Consolidated revenue from income statement",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Printed superscript6 by title versus definition footnote5: denominator explicitly consolidated Revenue. Preserve publication footnote mapping irregularity. Green-space irrigation is deducted in ESRS consumption, not in company supply.",
      "rows": [
        {
          "label": "Water consumption per net revenue",
          "values": {
            "2025": 16.3,
            "2024": 14.4
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03395.txt"
    },
    {
      "id": "MB2025-3395-4",
      "physical_page": 3395,
      "printed_page": 155,
      "title": "Company-specific water supply",
      "unit": "1000 m3",
      "scope": "Own operations worldwide, production subset",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Company method=water withdrawal-transfer to third parties; cannot deduct irrigation/wastewater. Not comparable to ESRS consumption.",
      "rows": [
        {
          "label": "Water supply in own operations",
          "values": {
            "2025": 7170,
            "2024": 7471
          }
        },
        {
          "label": "thereof in production",
          "values": {
            "2025": 5892,
            "2024": 6238
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03395.txt"
    },
    {
      "id": "MB2025-3395-5",
      "physical_page": 3395,
      "printed_page": 155,
      "title": "Water supply in production per vehicle",
      "unit": "m3/vehicle",
      "scope": "Own production Cars versus Vans",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Cars increase principally denominator decline. Company method, not ESRS consumption.",
      "rows": [
        {
          "label": "Mercedes-Benz Cars",
          "values": {
            "2025": 3.81,
            "2024": 3.79
          }
        },
        {
          "label": "Mercedes-Benz Vans",
          "values": {
            "2025": 3.35,
            "2024": 3.56
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03395.txt"
    },
    {
      "id": "MB2025-3404-6",
      "physical_page": 3404,
      "printed_page": 164,
      "title": "Resource inflows",
      "unit": "mixed:1000t for weights;% for shares",
      "scope": "Table titled Mercedes-Benz Group",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Footnote at gross-inflow-definition sentence: Information exclusively for Mercedes-Benz Cars. Table footnote1: biological share rounded. Do not silently resolve Cars/Group boundary. IMDS and industry-standard estimates.",
      "rows": [
        {
          "label": "Total weight products and technical/biological materials [1000t]",
          "values": {
            "2025": 3890,
            "2024": 4096
          }
        },
        {
          "label": "Share certified biological materials [%]",
          "values": {
            "2025": 0,
            "2024": 0
          }
        },
        {
          "label": "Weight secondary materials [1000t]",
          "values": {
            "2025": 686,
            "2024": 711
          }
        },
        {
          "label": "Share secondary materials [%]",
          "values": {
            "2025": 17.6,
            "2024": 17.4
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03404.txt"
    },
    {
      "id": "MB2025-3405-7",
      "physical_page": 3405,
      "printed_page": 165,
      "title": "Waste",
      "unit": "1000 t except identified percentage",
      "scope": "Own operations; construction/demolition included",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Footnote1 increases on identified rows from one-off nonproduction construction/demolition.2024 nonhazardous incineration revised-400t. Recycling definition includes recycling and preparation for reuse. Do not sum subtotals with constituents.",
      "rows": [
        {
          "label": "Hazardous: preparation for reuse",
          "values": {
            "2025": 0.3,
            "2024": 0.2
          }
        },
        {
          "label": "Hazardous: recycling",
          "values": {
            "2025": 18.6,
            "2024": 21.3
          }
        },
        {
          "label": "Hazardous: other recovery",
          "values": {
            "2025": 23.7,
            "2024": 24.7
          }
        },
        {
          "label": "Total hazardous diverted from disposal",
          "values": {
            "2025": 42.6,
            "2024": 46.2
          }
        },
        {
          "label": "Nonhazardous: preparation for reuse",
          "values": {
            "2025": 5.3,
            "2024": 2.7
          }
        },
        {
          "label": "Nonhazardous: recycling",
          "values": {
            "2025": 716.4,
            "2024": 561.3
          }
        },
        {
          "label": "Nonhazardous: other recovery",
          "values": {
            "2025": 101.4,
            "2024": 85.1
          }
        },
        {
          "label": "Total nonhazardous diverted from disposal",
          "values": {
            "2025": 823.1,
            "2024": 649.1
          }
        },
        {
          "label": "Total diverted from disposal",
          "values": {
            "2025": 865.7,
            "2024": 695.3
          }
        },
        {
          "label": "Hazardous: incineration",
          "values": {
            "2025": 2.0,
            "2024": 2.3
          }
        },
        {
          "label": "Hazardous: landfill",
          "values": {
            "2025": 1.6,
            "2024": 8.8
          }
        },
        {
          "label": "Hazardous: other disposal",
          "values": {
            "2025": 8.3,
            "2024": 2.6
          }
        },
        {
          "label": "Total hazardous directed to disposal",
          "values": {
            "2025": 11.9,
            "2024": 13.7
          }
        },
        {
          "label": "Nonhazardous: incineration",
          "values": {
            "2025": 0.7,
            "2024": 1.1
          }
        },
        {
          "label": "Nonhazardous: landfill",
          "values": {
            "2025": 19.7,
            "2024": 5.7
          }
        },
        {
          "label": "Nonhazardous: other disposal",
          "values": {
            "2025": 4.4,
            "2024": 3.6
          }
        },
        {
          "label": "Total nonhazardous directed to disposal",
          "values": {
            "2025": 24.8,
            "2024": 10.4
          }
        },
        {
          "label": "Total directed to disposal",
          "values": {
            "2025": 36.7,
            "2024": 24.1
          }
        },
        {
          "label": "Total waste",
          "values": {
            "2025": 902.4,
            "2024": 719.4
          }
        },
        {
          "label": "thereof nonrecycled",
          "values": {
            "2025": 161.9,
            "2024": 134.0
          }
        },
        {
          "label": "thereof nonrecycled share [%]",
          "values": {
            "2025": 17.9,
            "2024": 18.7
          }
        },
        {
          "label": "thereof radioactive",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03405.txt"
    },
    {
      "id": "MB2025-3405-8",
      "physical_page": 3405,
      "printed_page": 165,
      "title": "Production waste per vehicle",
      "unit": "kg/vehicle",
      "scope": "Own-production Cars versus Vans",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Company-specific metric; excludes nonproduction waste driving total increase.",
      "rows": [
        {
          "label": "Cars total",
          "values": {
            "2025": 358.1,
            "2024": 367.5
          }
        },
        {
          "label": "Cars thereof disposal",
          "values": {
            "2025": 1.9,
            "2024": 2.4
          }
        },
        {
          "label": "Vans total",
          "values": {
            "2025": 83.9,
            "2024": 88.6
          }
        },
        {
          "label": "Vans thereof disposal",
          "values": {
            "2025": 5.3,
            "2024": 8.1
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03405.txt"
    },
    {
      "id": "MB2025-3411-9",
      "physical_page": 3411,
      "printed_page": 171,
      "title": "Taxonomy summary with cross-referenced2024 denominators",
      "unit": "EURm for amounts;% for percentages",
      "scope": "Consolidated Taxonomy reporting",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "2024 includes activities3.18/6.15 treated nonmaterial2025. All aligned amounts climate mitigation;3.3 enabling;no transitional. Total revenue and CapEx IFRS provenance reasonable assurance, allocations limited.",
      "rows": [
        {
          "label": "Revenue total [EURm]",
          "values": {
            "2025": 132214,
            "2024": 145594
          }
        },
        {
          "label": "Revenue aligned [EURm]",
          "values": {
            "2025": 18838,
            "2024": 18729
          }
        },
        {
          "label": "Revenue aligned [% total]",
          "values": {
            "2025": 14.2,
            "2024": 12.9
          }
        },
        {
          "label": "CapEx total [EURm]",
          "values": {
            "2025": 25115,
            "2024": 23620
          }
        },
        {
          "label": "CapEx aligned [EURm]",
          "values": {
            "2025": 7381,
            "2024": 7116
          }
        },
        {
          "label": "CapEx aligned [% total]",
          "values": {
            "2025": 29.4,
            "2024": 30.1
          }
        },
        {
          "label": "OpEx total [EURm]",
          "values": {
            "2025": 6931,
            "2024": 6628
          }
        },
        {
          "label": "OpEx aligned [EURm]",
          "values": {
            "2025": 2274,
            "2024": 2365
          }
        },
        {
          "label": "OpEx aligned [% total]",
          "values": {
            "2025": 32.8,
            "2024": 35.7
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03411.txt",
      "cross_source_pages": [
        3411,
        3413,
        3416,
        3418
      ],
      "exact_table_layout": false
    },
    {
      "id": "MB2025-3411-10",
      "physical_page": 3411,
      "printed_page": 171,
      "title": "Taxonomy2025 eligibility/materiality",
      "unit": "% denominator",
      "scope": "Each KPI own denominator",
      "period_columns": [
        "eligible2025",
        "unassessed_nonmaterial2025",
        "enabling2025"
      ],
      "footnotes_and_definition": "Nonmaterial activities not assessed;dash preserved. Total values2024 in previous table are cross-supported physical3413/3416/3418, not3411 alone.",
      "rows": [
        {
          "label": "Revenue",
          "values": {
            "eligible2025": 94.1,
            "unassessed_nonmaterial2025": 4.9,
            "enabling2025": 13.6
          }
        },
        {
          "label": "CapEx",
          "values": {
            "eligible2025": 99.4,
            "unassessed_nonmaterial2025": 0.6,
            "enabling2025": 25.4
          }
        },
        {
          "label": "OpEx",
          "values": {
            "eligible2025": 100.0,
            "unassessed_nonmaterial2025": "–",
            "enabling2025": 32.8
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03411.txt"
    },
    {
      "id": "MB2025-3413-11",
      "physical_page": 3413,
      "printed_page": 173,
      "title": "Taxonomy revenue breakdown",
      "unit": "EUR million;percentages separately",
      "scope": "Consolidated income statement revenue",
      "period_columns": [
        "2025_aligned",
        "2025_total",
        "2025_percent",
        "2024_aligned",
        "2024_total",
        "2024_percent"
      ],
      "footnotes_and_definition": "Direct/allocated revenue as described source. Total aligned rises but prose says fell;IFRS15 subset falls;unresolved referent.2024 comparator different taxonomy minor-activity perimeter.",
      "rows": [
        {
          "label": "IFRS15",
          "values": {
            "2025_aligned": 17521,
            "2025_total": 115033,
            "2025_percent": 15.2,
            "2024_aligned": 17740,
            "2024_total": 128477,
            "2024_percent": 13.8
          }
        },
        {
          "label": "Other revenue",
          "values": {
            "2025_aligned": 1317,
            "2025_total": 17181,
            "2025_percent": 7.7,
            "2024_aligned": 989,
            "2024_total": 17117,
            "2024_percent": 5.8
          }
        },
        {
          "label": "Total",
          "values": {
            "2025_aligned": 18838,
            "2025_total": 132214,
            "2025_percent": 14.2,
            "2024_aligned": 18729,
            "2024_total": 145594,
            "2024_percent": 12.9
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03413.txt"
    },
    {
      "id": "MB2025-3416-12",
      "physical_page": 3416,
      "printed_page": 176,
      "title": "Taxonomy CapEx breakdown",
      "unit": "EUR million;percentages separately",
      "scope": "Additions to relevant intangibles/PPE/ROU/operating-lease assets",
      "period_columns": [
        "2025_aligned",
        "2025_total",
        "2025_percent",
        "2024_aligned",
        "2024_total",
        "2024_percent"
      ],
      "footnotes_and_definition": "Excludes goodwill;includes business-combination additions;lease equipment externally dealer-acquired vehicles;held-for-sale cutoff. Development row is subset,not additive. Mixed architecture allocation future sales except PHEV2025 only.",
      "rows": [
        {
          "label": "Intangible assets",
          "values": {
            "2025_aligned": 2851,
            "2025_total": 4260,
            "2025_percent": 66.9,
            "2024_aligned": 3170,
            "2024_total": 4626,
            "2024_percent": 68.5
          }
        },
        {
          "label": "thereof capitalized development",
          "values": {
            "2025_aligned": 2707,
            "2025_total": 3625,
            "2025_percent": 74.7,
            "2024_aligned": 3084,
            "2024_total": 4137,
            "2024_percent": 74.5
          }
        },
        {
          "label": "PPE",
          "values": {
            "2025_aligned": 3447,
            "2025_total": 5482,
            "2025_percent": 62.9,
            "2024_aligned": 2570,
            "2024_total": 4039,
            "2024_percent": 63.6
          }
        },
        {
          "label": "ROU assets",
          "values": {
            "2025_aligned": 110,
            "2025_total": 613,
            "2025_percent": 17.9,
            "2024_aligned": 105,
            "2024_total": 456,
            "2024_percent": 23.0
          }
        },
        {
          "label": "Equipment on operating leases",
          "values": {
            "2025_aligned": 973,
            "2025_total": 14760,
            "2025_percent": 6.6,
            "2024_aligned": 1271,
            "2024_total": 14499,
            "2024_percent": 8.8
          }
        },
        {
          "label": "Total",
          "values": {
            "2025_aligned": 7381,
            "2025_total": 25115,
            "2025_percent": 29.4,
            "2024_aligned": 7116,
            "2024_total": 23620,
            "2024_percent": 30.1
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03416.txt"
    },
    {
      "id": "MB2025-3418-13",
      "physical_page": 3418,
      "printed_page": 178,
      "title": "Taxonomy OpEx breakdown",
      "unit": "EUR million;percentages separately",
      "scope": "Taxonomy-only expenditure subset,not IFRS total operating costs",
      "period_columns": [
        "2025_aligned",
        "2025_total",
        "2025_percent",
        "2024_aligned",
        "2024_total",
        "2024_percent"
      ],
      "footnotes_and_definition": "Expensed R&D plus shortterm leases,renovations,certain repairs/maintenance. R&D mixed-architecture future allocation;PHEV current2025 only. Source prose/table direction mismatch unresolved.",
      "rows": [
        {
          "label": "Research and noncapitalized development",
          "values": {
            "2025_aligned": 2108,
            "2025_total": 6055,
            "2025_percent": 34.8,
            "2024_aligned": 2154,
            "2024_total": 5580,
            "2024_percent": 38.6
          }
        },
        {
          "label": "Other operating expenditure",
          "values": {
            "2025_aligned": 166,
            "2025_total": 876,
            "2025_percent": 18.9,
            "2024_aligned": 211,
            "2024_total": 1048,
            "2024_percent": 20.1
          }
        },
        {
          "label": "Total",
          "values": {
            "2025_aligned": 2274,
            "2025_total": 6931,
            "2025_percent": 32.8,
            "2024_aligned": 2365,
            "2024_total": 6628,
            "2024_percent": 35.7
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03418.txt"
    },
    {
      "id": "MB2025-3420-14",
      "physical_page": 3420,
      "printed_page": 180,
      "title": "Employees by region and gender",
      "unit": "headcount",
      "scope": "Active fully consolidated workforce at Dec31 incl holiday workers",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Excludes trainees,thesis writers,interns,working students,PhDs,senior experts. Total headcount explicitly reasonable assurance;do not extend automatically all breakdowns. Germany subset Europe.",
      "rows": [
        {
          "label": "Europe",
          "values": {
            "2025": 130061,
            "2024": 137610
          }
        },
        {
          "label": "thereof Germany",
          "values": {
            "2025": 107889,
            "2024": 114741
          }
        },
        {
          "label": "North America",
          "values": {
            "2025": 12738,
            "2024": 13321
          }
        },
        {
          "label": "Asia",
          "values": {
            "2025": 17578,
            "2024": 18740
          }
        },
        {
          "label": "Other markets",
          "values": {
            "2025": 3743,
            "2024": 5593
          }
        },
        {
          "label": "Total",
          "values": {
            "2025": 164120,
            "2024": 175264
          }
        },
        {
          "label": "Female",
          "values": {
            "2025": 39240,
            "2024": 41605
          }
        },
        {
          "label": "Male",
          "values": {
            "2025": 124880,
            "2024": 133659
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03420.txt"
    },
    {
      "id": "MB2025-3421-15",
      "physical_page": 3421,
      "printed_page": 181,
      "title": "Employee contracts",
      "unit": "headcount",
      "scope": "At Dec31 active workforce;categories overlap",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Non-guaranteed hours subset temporary. Full/part-time gender subtotals mismatch total genders by1 in2025;preserve source and flag.",
      "rows": [
        {
          "label": "Full time",
          "values": {
            "2025": 152528,
            "2024": 163132
          }
        },
        {
          "label": "Full time female",
          "values": {
            "2025": 31615,
            "2024": 33538
          }
        },
        {
          "label": "Full time male",
          "values": {
            "2025": 120913,
            "2024": 129594
          }
        },
        {
          "label": "Part time",
          "values": {
            "2025": 11592,
            "2024": 12132
          }
        },
        {
          "label": "Part time female",
          "values": {
            "2025": 7624,
            "2024": 8067
          }
        },
        {
          "label": "Part time male",
          "values": {
            "2025": 3968,
            "2024": 4065
          }
        },
        {
          "label": "Permanent",
          "values": {
            "2025": 160334,
            "2024": 169476
          }
        },
        {
          "label": "Permanent female",
          "values": {
            "2025": 38273,
            "2024": 40045
          }
        },
        {
          "label": "Permanent male",
          "values": {
            "2025": 122061,
            "2024": 129431
          }
        },
        {
          "label": "Temporary",
          "values": {
            "2025": 3786,
            "2024": 5788
          }
        },
        {
          "label": "Temporary female",
          "values": {
            "2025": 967,
            "2024": 1560
          }
        },
        {
          "label": "Temporary male",
          "values": {
            "2025": 2819,
            "2024": 4228
          }
        },
        {
          "label": "Non-guaranteed hours",
          "values": {
            "2025": 650,
            "2024": 600
          }
        },
        {
          "label": "Non-guaranteed female",
          "values": {
            "2025": 203,
            "2024": 196
          }
        },
        {
          "label": "Non-guaranteed male",
          "values": {
            "2025": 447,
            "2024": 404
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03421.txt"
    },
    {
      "id": "MB2025-3421-16",
      "physical_page": 3421,
      "printed_page": 181,
      "title": "Employee turnover",
      "unit": "headcount or % as labeled",
      "scope": "Active ESRS versus permanent/core company-specific population",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "2025 denominator quarterly annual average rather than year-end.2024 ESRS rate unchanged12.9;core restated6.3 versus former6.5. Leavers include voluntary,dismissal,retirement,death;not all job cuts.",
      "rows": [
        {
          "label": "Active annual average [headcount]",
          "values": {
            "2025": 169240,
            "2024": 179291
          }
        },
        {
          "label": "ESRS leavers [headcount]",
          "values": {
            "2025": 22663,
            "2024": 22601
          }
        },
        {
          "label": "ESRS turnover [%]",
          "values": {
            "2025": 13.4,
            "2024": 12.9
          }
        },
        {
          "label": "Core leavers [headcount]",
          "values": {
            "2025": 13391,
            "2024": 11006
          }
        },
        {
          "label": "Core turnover [%]",
          "values": {
            "2025": 8.2,
            "2024": 6.3
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03421.txt"
    },
    {
      "id": "MB2025-3424-17",
      "physical_page": 3424,
      "printed_page": 184,
      "title": "Pay gap and total remuneration",
      "unit": "% or ratio as labeled",
      "scope": "Global unadjusted gross hourly earnings and total remuneration",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Gender gap=(male avg-female avg)/male avg;no region/job adjustment. Total remuneration includes monetary/in-kind benefits. Highest-paid individual,not automatically CEO.",
      "rows": [
        {
          "label": "Gender pay gap [%]",
          "values": {
            "2025": 3.9,
            "2024": 4.8
          }
        },
        {
          "label": "Highest paid:median annual total remuneration [x:1]",
          "values": {
            "2025": 135,
            "2024": 175
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03424.txt"
    },
    {
      "id": "MB2025-3426-18",
      "physical_page": 3426,
      "printed_page": 186,
      "title": "OH&S",
      "unit": "mixed",
      "scope": "Own workforce under legal/ISO45001-based management",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Management coverage not certification percentage. Local-law recordable injuries excludes commuting;rate per1million attendance hours.",
      "rows": [
        {
          "label": "Coverage [%]",
          "values": {
            "2025": 100,
            "2024": 100
          }
        },
        {
          "label": "Recordable work accidents [count]",
          "values": {
            "2025": 815,
            "2024": 989
          }
        },
        {
          "label": "Recordable work accident rate [per1m hours]",
          "values": {
            "2025": 2.8,
            "2024": 3.2
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03426.txt"
    },
    {
      "id": "MB2025-3427-19",
      "physical_page": 3427,
      "printed_page": 187,
      "title": "Work-related fatalities",
      "unit": "count",
      "scope": "Own workforce versus other workers at Group sites",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Ill-health figures only cases reported or identified medical monitoring under local rules;no cases reported. Dashes retained.",
      "rows": [
        {
          "label": "Injury own workforce",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Injury other site workers",
          "values": {
            "2025": 1,
            "2024": 2
          }
        },
        {
          "label": "Ill-health own workforce",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Ill-health other site workers",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03427.txt"
    },
    {
      "id": "MB2025-3429-20",
      "physical_page": 3429,
      "printed_page": 189,
      "title": "Top management gender levels1–2",
      "unit": "headcount or % as labeled",
      "scope": "First2 levels below management board at Dec31",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Different from senior levels1–3 and AG-only statutory tiers.",
      "rows": [
        {
          "label": "Male [headcount]",
          "values": {
            "2025": 294,
            "2024": 330
          }
        },
        {
          "label": "Female [headcount]",
          "values": {
            "2025": 94,
            "2024": 100
          }
        },
        {
          "label": "Male [%]",
          "values": {
            "2025": 75.8,
            "2024": 76.7
          }
        },
        {
          "label": "Female [%]",
          "values": {
            "2025": 24.2,
            "2024": 23.3
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03429.txt"
    },
    {
      "id": "MB2025-3430-21",
      "physical_page": 3430,
      "printed_page": 190,
      "title": "Senior management gender levels1–3",
      "unit": "headcount or % as labeled",
      "scope": "First3 levels below management board at Dec31",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Company-specific;explicit reasonable-assurance footnote. Do not map to AG parent-only statutory tiers. Independent assurance-letter category is levels 1–3 gender distribution (absolute); do not infer same assurance over percentages or targets.",
      "rows": [
        {
          "label": "Male [headcount]",
          "values": {
            "2025": 1505,
            "2024": 1656
          }
        },
        {
          "label": "Female [headcount]",
          "values": {
            "2025": 547,
            "2024": 593
          }
        },
        {
          "label": "Male [%]",
          "values": {
            "2025": 73.3,
            "2024": 73.6
          }
        },
        {
          "label": "Female [%]",
          "values": {
            "2025": 26.7,
            "2024": 26.4
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03430.txt"
    },
    {
      "id": "MB2025-3431-22",
      "physical_page": 3431,
      "printed_page": 191,
      "title": "Discrimination and labour complaints",
      "unit": "count;EUR for penalties",
      "scope": "Written HR disciplinary matters and reported serious cases",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "Serious includes harassment,racism,physical/psychological integrity. Penalties approximated in prose and other operating income/expense.",
      "rows": [
        {
          "label": "Reported serious discrimination",
          "values": {
            "2025": 11,
            "2024": 21
          }
        },
        {
          "label": "Internal-channel complaints",
          "values": {
            "2025": 300,
            "2024": 334
          }
        },
        {
          "label": "National-contact-point complaints",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Related fines/sanctions/compensation [EUR approximate]",
          "values": {
            "2025": 51000,
            "2024": 10000
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03431.txt"
    },
    {
      "id": "MB2025-3452-23",
      "physical_page": 3452,
      "printed_page": 212,
      "title": "Donations/sponsorships with possible political influence",
      "unit": "EUR",
      "scope": "Disclosed possible-influence contributions;not party contributions",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_definition": "2025 no party contributions. Donations in kind monetized.2024 Europe donations revised+1620000,Asia sponsorship+582624 due reassessment.",
      "rows": [
        {
          "label": "Donations total",
          "values": {
            "2025": 3026624,
            "2024": 2895188
          }
        },
        {
          "label": "Donations Europe",
          "values": {
            "2025": 3020709,
            "2024": 2892852
          }
        },
        {
          "label": "Donations North America",
          "values": {
            "2025": 5381,
            "2024": "–"
          }
        },
        {
          "label": "Donations Asia",
          "values": {
            "2025": 534,
            "2024": 2336
          }
        },
        {
          "label": "Donations other",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Sponsorship total",
          "values": {
            "2025": 855685,
            "2024": 1283097
          }
        },
        {
          "label": "Sponsorship Europe",
          "values": {
            "2025": 153160,
            "2024": 374881
          }
        },
        {
          "label": "Sponsorship North America",
          "values": {
            "2025": 42031,
            "2024": 192771
          }
        },
        {
          "label": "Sponsorship Asia",
          "values": {
            "2025": 645794,
            "2024": 672742
          }
        },
        {
          "label": "Sponsorship other",
          "values": {
            "2025": 14700,
            "2024": 42703
          }
        }
      ],
      "exact_reported_values": true,
      "visual_verified": true,
      "source_text": "source-evidence/page-03452.txt"
    }
  ],
  "climate": [
    {
      "id": "MB2025-CL-3379-1",
      "physical_page": 3379,
      "printed_page": 139,
      "title": "Energy production",
      "units": "GWh",
      "population_and_measurement": "Own sites; electricity/heat internally used and transferred to third parties",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Energy generated is not energy consumption. Nonrenewable includes CHP; no automatic renewable attribution from external-power contracts.",
      "rows": [
        {
          "label": "Nonrenewable",
          "values": {
            "2025": 1153,
            "2024": 1217
          }
        },
        {
          "label": "Renewable",
          "values": {
            "2025": 86,
            "2024": 57
          }
        },
        {
          "label": "Total",
          "values": {
            "2025": 1239,
            "2024": 1274
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03379.txt"
    },
    {
      "id": "MB2025-CL-3380-2",
      "physical_page": 3380,
      "printed_page": 140,
      "title": "Total energy consumption",
      "units": "GWh unless row marked percent",
      "population_and_measurement": "Worldwide energy data; invoices/meters and estimates where unavailable",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Production-specific exclusion of fuels does not apply to this total. Dashes kept as printed; percentage rows not additive with quantities.",
      "rows": [
        {
          "label": "Coal and coal products",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Crude oil and petroleum products",
          "values": {
            "2025": 343,
            "2024": 413
          }
        },
        {
          "label": "Natural gas",
          "values": {
            "2025": 2145,
            "2024": 2407
          }
        },
        {
          "label": "Other fossil sources",
          "values": {
            "2025": 10,
            "2024": 10
          }
        },
        {
          "label": "Purchased electricity/heat/steam/cooling from fossil sources",
          "values": {
            "2025": 472,
            "2024": 460
          }
        },
        {
          "label": "Total fossil sources",
          "values": {
            "2025": 2970,
            "2024": 3290
          }
        },
        {
          "label": "Fossil share [%]",
          "values": {
            "2025": 53.4,
            "2024": 55.6
          }
        },
        {
          "label": "Nuclear sources",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Nuclear share [%]",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Renewable fuel",
          "values": {
            "2025": 30,
            "2024": 33
          }
        },
        {
          "label": "Purchased electricity/heat/steam/cooling from renewable sources",
          "values": {
            "2025": 2502,
            "2024": 2551
          }
        },
        {
          "label": "Self-generated nonfuel renewable energy",
          "values": {
            "2025": 64,
            "2024": 42
          }
        },
        {
          "label": "Total renewable sources",
          "values": {
            "2025": 2596,
            "2024": 2626
          }
        },
        {
          "label": "Renewable share [%]",
          "values": {
            "2025": 46.6,
            "2024": 44.4
          }
        },
        {
          "label": "Total energy",
          "values": {
            "2025": 5566,
            "2024": 5916
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03380.txt"
    },
    {
      "id": "MB2025-CL-3380-3",
      "physical_page": 3380,
      "printed_page": 140,
      "title": "High-climate-impact revenue reconciliation and energy intensity",
      "units": "EUR million or MWh/EUR million as labeled",
      "population_and_measurement": "High climate impact sector denominator, not all Group revenue",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Revenue includes activity3.3 scope and specified component/infrastructure/used-goods activities in prose. Footnote references consolidated income-statement Revenue for total.",
      "rows": [
        {
          "label": "High-climate-impact revenue [EURm]",
          "values": {
            "2025": 110182,
            "2024": 121640
          }
        },
        {
          "label": "Other revenue [EURm]",
          "values": {
            "2025": 22032,
            "2024": 23954
          }
        },
        {
          "label": "Total revenue [EURm]",
          "values": {
            "2025": 132214,
            "2024": 145594
          }
        },
        {
          "label": "Energy intensity [MWh/EURm high-impact revenue]",
          "values": {
            "2025": 50.5,
            "2024": 48.6
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03380.txt"
    },
    {
      "id": "MB2025-CL-3380-4",
      "physical_page": 3380,
      "printed_page": 140,
      "title": "Company-specific production energy",
      "units": "GWh or MWh/vehicle as labeled",
      "population_and_measurement": "Production excludes source-defined fuels and self-generated energy transferred",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Without fuels refers operational exclusions discussed physical3379; do not describe production as wholly fossil-fuel-free.",
      "rows": [
        {
          "label": "Production consumption [GWh]",
          "values": {
            "2025": 4177,
            "2024": 4296
          }
        },
        {
          "label": "Nonrenewable energy transfer to third parties [GWh]",
          "values": {
            "2025": 98,
            "2024": 144
          }
        },
        {
          "label": "Cars energy/vehicle [MWh/vehicle]",
          "values": {
            "2025": 2.7,
            "2024": 2.65
          }
        },
        {
          "label": "Vans energy/vehicle [MWh/vehicle]",
          "values": {
            "2025": 2.37,
            "2024": 2.31
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03380.txt"
    },
    {
      "id": "MB2025-CL-3385-5",
      "physical_page": 3385,
      "printed_page": 145,
      "title": "Group gross GHG emissions",
      "units": "million tCO2e unless row marked percent",
      "population_and_measurement": "GHG Protocol; Scope3 includes BBAC/FBAC unit sales, 12 reported categories",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "2024 category1 restated +6.7MtCO2e; category2 -2.1MtCO2e. Category14 decrease reflects methodology;2024 not restated because impracticable. n.s. means nonsignificant, not zero. Rounded subcategories need not exactly sum.",
      "rows": [
        {
          "label": "Scope1",
          "values": {
            "2025": 0.5,
            "2024": 0.6
          }
        },
        {
          "label": "Scope1 under regulated emission trading [%]",
          "values": {
            "2025": 78.3,
            "2024": 77.4
          }
        },
        {
          "label": "Scope2 location-based",
          "values": {
            "2025": 0.9,
            "2024": 1.0
          }
        },
        {
          "label": "Scope2 market-based",
          "values": {
            "2025": 0.1,
            "2024": 0.1
          }
        },
        {
          "label": "Scope3 total",
          "values": {
            "2025": 118.8,
            "2024": 133.5
          }
        },
        {
          "label": "Category1 purchased goods/services",
          "values": {
            "2025": 25.9,
            "2024": 28.6
          }
        },
        {
          "label": "Category2 capital goods",
          "values": {
            "2025": 1.3,
            "2024": 0.8
          }
        },
        {
          "label": "Category3 fuel/energy-related",
          "values": {
            "2025": 0.4,
            "2024": 0.4
          }
        },
        {
          "label": "Category4 upstream transport/distribution",
          "values": {
            "2025": 1.8,
            "2024": 2.3
          }
        },
        {
          "label": "Category5 waste",
          "values": {
            "2025": 0.2,
            "2024": 0.1
          }
        },
        {
          "label": "Category6 business travel",
          "values": {
            "2025": 0.04,
            "2024": 0.1
          }
        },
        {
          "label": "Category7 employee commuting",
          "values": {
            "2025": 0.2,
            "2024": 0.2
          }
        },
        {
          "label": "Category8 upstream leased assets",
          "values": {
            "2025": "n.s.",
            "2024": "n.s."
          }
        },
        {
          "label": "Category9 downstream transportation",
          "values": {
            "2025": "n.s.",
            "2024": "n.s."
          }
        },
        {
          "label": "Category10 sold-products processing",
          "values": {
            "2025": 0.1,
            "2024": 0.1
          }
        },
        {
          "label": "Category11 sold-products use",
          "values": {
            "2025": 86.5,
            "2024": 97.0
          }
        },
        {
          "label": "Category12 end-of-life treatment",
          "values": {
            "2025": 1.0,
            "2024": 1.0
          }
        },
        {
          "label": "Category13 downstream leased assets",
          "values": {
            "2025": "n.s.",
            "2024": "n.s."
          }
        },
        {
          "label": "Category14 franchises",
          "values": {
            "2025": 1.1,
            "2024": 2.5
          }
        },
        {
          "label": "Category15 investments",
          "values": {
            "2025": 0.3,
            "2024": 0.4
          }
        },
        {
          "label": "Total scopes1–3 location-based",
          "values": {
            "2025": 120.2,
            "2024": 135.1
          }
        },
        {
          "label": "Total scopes1–3 market-based",
          "values": {
            "2025": 119.4,
            "2024": 134.2
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03385.txt"
    },
    {
      "id": "MB2025-CL-3385-6",
      "physical_page": 3385,
      "printed_page": 145,
      "title": "Biogenic CO2",
      "units": "million tCO2",
      "population_and_measurement": "Separately disclosed biogenic emissions; not same unit as CO2-equivalent GHG totals",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "2024 Scope2 actual-value correction +0.002MtCO2. Rounded total may not exactly equal rounded subcomponents.",
      "rows": [
        {
          "label": "Total",
          "values": {
            "2025": 5.8,
            "2024": 7.23
          }
        },
        {
          "label": "Scope1",
          "values": {
            "2025": 0.007,
            "2024": 0.008
          }
        },
        {
          "label": "Scope2",
          "values": {
            "2025": 0.004,
            "2024": 0.004
          }
        },
        {
          "label": "Scope3",
          "values": {
            "2025": 5.79,
            "2024": 7.22
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03385.txt"
    },
    {
      "id": "MB2025-CL-3385-7",
      "physical_page": 3385,
      "printed_page": 145,
      "title": "GHG intensity",
      "units": "tCO2e/EUR million",
      "population_and_measurement": "GHG numerator includes BBAC/FBAC unit sales; IFRS consolidated Revenue denominator",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Do not force emissions into financial consolidation perimeter or treat market/location variants as additive.",
      "rows": [
        {
          "label": "Location-based",
          "values": {
            "2025": 909,
            "2024": 896
          }
        },
        {
          "label": "Market-based",
          "values": {
            "2025": 902,
            "2024": 890
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03385.txt"
    },
    {
      "id": "MB2025-CL-3386-8",
      "physical_page": 3386,
      "printed_page": 146,
      "title": "Cars company-specific lifecycle GHG",
      "units": "Units encoded by column: MtCO2e, MtCO2, tCO2/vehicle",
      "population_and_measurement": "Annual new-car fleet incl equity-accounted BBAC; selected Scope3 categories; projected lifecycle",
      "period_columns": [
        "2025_MtCO2e",
        "2024_MtCO2e",
        "2025_MtCO2",
        "2024_MtCO2",
        "2025_tCO2_vehicle",
        "2024_tCO2_vehicle"
      ],
      "footnotes_and_cautions": "Production scopes1/2 excludes fuels. Use phase assumes200000km.2024 category1 restated +6MtCO2e,+5.1MtCO2,+2.5tCO2/car. Total excludes other Group Scope3 categories.",
      "rows": [
        {
          "label": "Production scopes1/2 market",
          "values": {
            "2025_MtCO2e": 0.3,
            "2024_MtCO2e": 0.3,
            "2025_MtCO2": 0.3,
            "2024_MtCO2": 0.3,
            "2025_tCO2_vehicle": 0.2,
            "2024_tCO2_vehicle": 0.2
          }
        },
        {
          "label": "Scope3 selected",
          "values": {
            "2025_MtCO2e": 90.5,
            "2024_MtCO2e": 101.5,
            "2025_MtCO2": 82.6,
            "2024_MtCO2": 93.3,
            "2025_tCO2_vehicle": 46.5,
            "2024_tCO2_vehicle": 46.5
          }
        },
        {
          "label": "Category1 purchased goods/services",
          "values": {
            "2025_MtCO2e": 21.9,
            "2024_MtCO2e": 24.3,
            "2025_MtCO2": 19.8,
            "2024_MtCO2": 21.9,
            "2025_tCO2_vehicle": 11.1,
            "2024_tCO2_vehicle": 10.9
          }
        },
        {
          "label": "Category4 transport/distribution",
          "values": {
            "2025_MtCO2e": 1.5,
            "2024_MtCO2e": 2.0,
            "2025_MtCO2": 1.5,
            "2024_MtCO2": 2.0,
            "2025_tCO2_vehicle": 0.9,
            "2024_tCO2_vehicle": 1.0
          }
        },
        {
          "label": "Category11 use WtW",
          "values": {
            "2025_MtCO2e": 66.3,
            "2024_MtCO2e": 74.4,
            "2025_MtCO2": 60.5,
            "2024_MtCO2": 68.6,
            "2025_tCO2_vehicle": 34.1,
            "2024_tCO2_vehicle": 34.2
          }
        },
        {
          "label": "Category12 end of life",
          "values": {
            "2025_MtCO2e": 0.8,
            "2024_MtCO2e": 0.8,
            "2025_MtCO2": 0.8,
            "2024_MtCO2": 0.8,
            "2025_tCO2_vehicle": 0.4,
            "2024_tCO2_vehicle": 0.4
          }
        },
        {
          "label": "Total value chain",
          "values": {
            "2025_MtCO2e": 90.8,
            "2024_MtCO2e": 101.8,
            "2025_MtCO2": 82.9,
            "2024_MtCO2": 93.6,
            "2025_tCO2_vehicle": 46.7,
            "2024_tCO2_vehicle": 46.7
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03386.txt"
    },
    {
      "id": "MB2025-CL-3386-9",
      "physical_page": 3386,
      "printed_page": 146,
      "title": "Vans company-specific lifecycle GHG",
      "units": "Units encoded by column: MtCO2e, MtCO2, tCO2/vehicle",
      "population_and_measurement": "Annual new-van fleet incl equity-accounted FBAC; selected Scope3 categories; projected lifecycle",
      "period_columns": [
        "2025_MtCO2e",
        "2024_MtCO2e",
        "2025_MtCO2",
        "2024_MtCO2",
        "2025_tCO2_vehicle",
        "2024_tCO2_vehicle"
      ],
      "footnotes_and_cautions": "Production scopes1/2 excludes fuels.2024 category1 restated +0.8MtCO2e,+0.7MtCO2,+1.7tCO2/vehicle. Footnote says per car despite Vans table; preserve vehicle context.",
      "rows": [
        {
          "label": "Production scopes1/2 market",
          "values": {
            "2025_MtCO2e": 0.1,
            "2024_MtCO2e": 0.1,
            "2025_MtCO2": 0.1,
            "2024_MtCO2": 0.1,
            "2025_tCO2_vehicle": 0.3,
            "2024_tCO2_vehicle": 0.3
          }
        },
        {
          "label": "Scope3 selected",
          "values": {
            "2025_MtCO2e": 24.7,
            "2024_MtCO2e": 27.5,
            "2025_MtCO2": 22.2,
            "2024_MtCO2": 25.0,
            "2025_tCO2_vehicle": 60.8,
            "2024_tCO2_vehicle": 61.8
          }
        },
        {
          "label": "Category1 purchased goods/services",
          "values": {
            "2025_MtCO2e": 4.0,
            "2024_MtCO2e": 4.4,
            "2025_MtCO2": 3.7,
            "2024_MtCO2": 4.0,
            "2025_tCO2_vehicle": 10.1,
            "2024_tCO2_vehicle": 9.9
          }
        },
        {
          "label": "Category4 transport/distribution",
          "values": {
            "2025_MtCO2e": 0.2,
            "2024_MtCO2e": 0.3,
            "2025_MtCO2": 0.2,
            "2024_MtCO2": 0.3,
            "2025_tCO2_vehicle": 0.7,
            "2024_tCO2_vehicle": 0.8
          }
        },
        {
          "label": "Category10 processing",
          "values": {
            "2025_MtCO2e": 0.1,
            "2024_MtCO2e": 0.1,
            "2025_MtCO2": 0.1,
            "2024_MtCO2": 0.1,
            "2025_tCO2_vehicle": 0.3,
            "2024_tCO2_vehicle": 0.3
          }
        },
        {
          "label": "Category11 use WtW",
          "values": {
            "2025_MtCO2e": 20.2,
            "2024_MtCO2e": 22.5,
            "2025_MtCO2": 18.0,
            "2024_MtCO2": 20.4,
            "2025_tCO2_vehicle": 49.2,
            "2024_tCO2_vehicle": 50.3
          }
        },
        {
          "label": "Category12 end of life",
          "values": {
            "2025_MtCO2e": 0.2,
            "2024_MtCO2e": 0.2,
            "2025_MtCO2": 0.2,
            "2024_MtCO2": 0.2,
            "2025_tCO2_vehicle": 0.5,
            "2024_tCO2_vehicle": 0.5
          }
        },
        {
          "label": "Total value chain",
          "values": {
            "2025_MtCO2e": 24.8,
            "2024_MtCO2e": 27.6,
            "2025_MtCO2": 22.3,
            "2024_MtCO2": 25.1,
            "2025_tCO2_vehicle": 61.1,
            "2024_tCO2_vehicle": 62.1
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03386.txt"
    },
    {
      "id": "MB2025-CL-3387-10",
      "physical_page": 3387,
      "printed_page": 147,
      "title": "Company-specific Scope1 and Scope2 information",
      "units": "1000 tCO2e table title; subset rows explicitly CO2",
      "population_and_measurement": "Own locations market-based; production excludes fuels",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Keep CO2-versus-CO2e row labels. Third-party-energy emissions concern self-generation not consumed by Group.",
      "rows": [
        {
          "label": "Total Scope1/2 market-based [CO2e]",
          "values": {
            "2025": 600,
            "2024": 684
          }
        },
        {
          "label": "thereof production CO2",
          "values": {
            "2025": 400,
            "2024": 423
          }
        },
        {
          "label": "thereof nonrenewable energy transferred CO2",
          "values": {
            "2025": 20,
            "2024": 29
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03387.txt"
    },
    {
      "id": "MB2025-CL-3387-11",
      "physical_page": 3387,
      "printed_page": 147,
      "title": "European new-fleet average CO2",
      "units": "g CO2/km",
      "population_and_measurement": "M1 passenger/N1 LCV; EU,Norway,Iceland; calendar-year registrations",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Reasonable-assurance category expressly marked. Internal figures may differ from final EU because some registration data unavailable; some unit-sales estimates used. Passenger includes smart JV CO2 pool;PHEV recertification/sales mix affects change.",
      "rows": [
        {
          "label": "Passenger cars",
          "values": {
            "2025": 106,
            "2024": 103
          }
        },
        {
          "label": "Light commercial vehicles",
          "values": {
            "2025": 183,
            "2024": 204
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03387.txt"
    },
    {
      "id": "MB2025-CL-3387-12",
      "physical_page": 3387,
      "printed_page": 147,
      "title": "US new-fleet GHG",
      "units": "g CO2/mile",
      "population_and_measurement": "Passenger cars,light-duty trucks,medium-duty vehicles; model-year production",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Reasonable-assurance category expressly marked. Internal/provisional self-certified test-cycle values with applicable credits;EPA verifies samples. Not directly comparable with EU g/km or calendar registrations.",
      "rows": [
        {
          "label": "Passenger cars",
          "values": {
            "2025": 215,
            "2024": 180
          }
        },
        {
          "label": "Light-duty trucks",
          "values": {
            "2025": 229,
            "2024": 265
          }
        },
        {
          "label": "Medium-duty vehicles",
          "values": {
            "2025": 396,
            "2024": 413
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03387.txt"
    },
    {
      "id": "MB2025-CL-3388-13",
      "physical_page": 3388,
      "printed_page": 148,
      "title": "China imported passenger-fleet consumption",
      "units": "l/100km",
      "population_and_measurement": "Mercedes-Benz China Ltd import fleet, not domestically produced cars",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Reasonable-assurance category marked. WLTC ModelName certified values weighted by imports;off-cycle technology credits;internal/provisional data may differ from authorities.",
      "rows": [
        {
          "label": "Imported passenger cars",
          "values": {
            "2025": 8.32,
            "2024": 8.38
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03388.txt"
    },
    {
      "id": "MB2025-CL-3389-14",
      "physical_page": 3389,
      "printed_page": 149,
      "title": "Carbon credits cancelled",
      "units": "1000 tCO2e or percent as labeled",
      "population_and_measurement": "Credits cancelled in reporting year; residual own-location Scope1/2 compensation",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Removal portion90% biogenic/10% technological sinks. Offsets tracked separately from gross targets; EU-origin/Article6 dashes retained. No projects removing/storing GHG within own/upstream/downstream operations during reporting period.",
      "rows": [
        {
          "label": "Total credits [1000tCO2e]",
          "values": {
            "2025": 600,
            "2024": 684
          }
        },
        {
          "label": "Removal share [%]",
          "values": {
            "2025": 6,
            "2024": 3
          }
        },
        {
          "label": "Reduction share [%]",
          "values": {
            "2025": 94,
            "2024": 97
          }
        },
        {
          "label": "Gold Standard share [%]",
          "values": {
            "2025": 94,
            "2024": 97
          }
        },
        {
          "label": "Puro.Earth share [%]",
          "values": {
            "2025": 0.6,
            "2024": 0.3
          }
        },
        {
          "label": "Verified Carbon Standard share [%]",
          "values": {
            "2025": 5.4,
            "2024": 2.7
          }
        },
        {
          "label": "EU project share [%]",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        },
        {
          "label": "Paris Article6 corresponding-adjustment share [%]",
          "values": {
            "2025": "–",
            "2024": "–"
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03389.txt"
    },
    {
      "id": "MB2025-CL-3389-15",
      "physical_page": 3389,
      "printed_page": 149,
      "title": "Future contracted carbon-credit cancellations",
      "units": "1000 tCO2e",
      "population_and_measurement": "Contractual agreements; total planned until2032 viewed at each reporting year",
      "period_columns": [
        "2025",
        "2024"
      ],
      "footnotes_and_cautions": "Not actual current-year cancellation or a fixed annual forecast;not automatically a balance-sheet liability amount.",
      "rows": [
        {
          "label": "Total until2032",
          "values": {
            "2025": 3980,
            "2024": 4507
          }
        }
      ],
      "visual_verified": true,
      "source_text": "source-evidence/page-03389.txt"
    }
  ],
  "coreExceptions": {
    "classification": "Unresolved source presentation or definition questions, not established errors",
    "items": [
      {
        "id": "legal_affairs_meeting_count",
        "physical_pages": [
          3253,
          3257
        ],
        "report_pages": [
          13,
          17
        ],
        "facts": "The narrative says three meetings in 2025, then describes three in-person meetings and one video conference. The attendance table uses a denominator of three for Legal Affairs Committee members.",
        "independent_review": "Both reviewers visually confirmed the wording and attendance denominator.",
        "status": "Unresolved wording or classification inconsistency. No corrected count inferred.",
        "model_rule": "Do not derive a definitive four-meeting total or silently replace the stated three."
      },
      {
        "id": "buyback_average_scope",
        "physical_pages": [
          3555
        ],
        "report_pages": [
          315
        ],
        "currency": "EUR",
        "facts": {
          "period": "March 2023 through November 2024",
          "program_count": 2,
          "shares_million_reported": "107",
          "purchase_price_million_including_transaction_costs": "6992",
          "average_price_per_share_reported": "63.62"
        },
        "derived": {
          "reported_shares_times_reported_average_million": "6807.34",
          "residual_vs_purchase_price_million": "184.66"
        },
        "independent_review": "Two reviewers visually confirmed the same values and programme period. Rounding of 107 million alone cannot account for the full residual.",
        "status": "Unresolved average-price scope or transaction-cost definition. Costs or different averaging scope might explain it, but the source does not quantify a bridge.",
        "model_rule": "Preserve the reported values. Do not invent fees, infer a corrected share count, or assert a proven report error."
      },
      {
        "id": "prior_cash_one_million",
        "physical_pages": [
          3497,
          3577,
          3582
        ],
        "report_pages": [
          257,
          337,
          342
        ],
        "currency": "EUR",
        "unit": "million",
        "period": "2024-12-31",
        "facts": {
          "cash_flow_closing_including_held_for_sale": "14516",
          "cash_flow_closing_excluding_held_for_sale": "14511",
          "cash_flow_held_for_sale": "5",
          "financial_instruments_cash_including_held_for_sale": "14517"
        },
        "status": "Unresolved one-million presentation difference; rounding or scope may contribute.",
        "model_rule": "Keep exact row-specific anchors and permit a one-million cross-presentation residual only on the explicitly identified check. Do not adjust source amounts."
      },
      {
        "id": "prior_credit_exposure_scope",
        "physical_pages": [
          3546,
          3548,
          3577,
          3591
        ],
        "report_pages": [
          306,
          308,
          337,
          351
        ],
        "currency": "EUR",
        "unit": "million",
        "period": "2024-12-31",
        "facts": {
          "balance_sheet_financial_services_net_excluding_held_for_sale": "87867",
          "financial_instruments_carrying_including_held_for_sale": "87950",
          "maximum_credit_exposure_table": "87867",
          "gross_stage_exposure_including_held_for_sale": "89056",
          "stage_loss_allowances": "1105"
        },
        "status": "Maximum-exposure table footnote describes Group amounts including held-for-sale, but its prior FS figure equals the excluding-held-for-sale amount. The instrument and stage-derived net figures also differ by one million.",
        "model_rule": "Do not force these figures to equality or assume collateral is the explanation; maximum exposure is expressly before collateral. Preserve sources and flag the unresolved boundary."
      }
    ]
  },
  "narrativeExceptions": [
    {
      "id": "VANS-2024-CUSTOMER-SUM",
      "pages": [
        3289
      ],
      "kind": "integer_count_residual",
      "status": "unresolved_source_exception",
      "reported_total": 405610,
      "component_sum": 405609,
      "unit": "vehicles",
      "action": "Retain exact source values; do not invent a rounding or classification explanation."
    },
    {
      "id": "TAXONOMY-REVENUE-DIRECTION",
      "pages": [
        3413
      ],
      "kind": "narrative_table_direction",
      "status": "unresolved_referent",
      "reported_2025": 18838,
      "reported_2024": 18729,
      "unit": "EUR million",
      "action": "Table total rises while prose says falls. IFRS15 subset declines, a possible narrower referent, not established."
    },
    {
      "id": "TAXONOMY-RD-DIRECTION",
      "pages": [
        3418
      ],
      "kind": "narrative_table_direction",
      "status": "unresolved_source_exception",
      "reported_2025": 2108,
      "reported_2024": 2154,
      "unit": "EUR million",
      "action": "Aligned expensed R&D declines despite explicit increased-less-sharply prose. Do not repair either disclosure."
    },
    {
      "id": "HEADCOUNT-GENDER-COMPONENTS",
      "pages": [
        3421
      ],
      "kind": "integer_count_residual",
      "status": "unresolved_source_exception",
      "female_reported": 39240,
      "female_components": 39239,
      "male_reported": 124880,
      "male_components": 124881,
      "unit": "people",
      "action": "Preserve one-person opposing residuals; overall workforce total reconciles."
    },
    {
      "id": "RESOURCE-INFLOW-FOOTNOTE",
      "pages": [
        3404
      ],
      "kind": "scope_footnote_ambiguity",
      "status": "unresolved_scope",
      "action": "Cars-only footnote attached to gross-inflow definition, Group-labelled table. Keep exact attachment and do not silently choose a perimeter."
    },
    {
      "id": "WATER-INTENSITY-FOOTNOTE",
      "pages": [
        3395
      ],
      "kind": "footnote_number",
      "status": "source_presentation_exception",
      "action": "Heading superscript6 differs from denominator footnote5; preserve explicit IFRS revenue denominator."
    },
    {
      "id": "LEGAL-AFFAIRS-MEETING-COUNT",
      "pages": [
        3253,
        3257
      ],
      "kind": "narrative_count",
      "status": "independently_confirmed_unresolved_source_exception",
      "outside_narrative_assignment": true,
      "action": "Three total versus three in-person plus one video; attendance3/3. No invented correction."
    },
    {
      "id": "AUDIT-COMMITTEE-SELF-EVALUATION-DATE",
      "pages": [
        3253,
        3473
      ],
      "kind": "date_consistency",
      "status": "unresolved_referent",
      "action": "11February2026 versus explicit10February2026. Different meetings/referents possible; no date replaced."
    },
    {
      "id": "TREASURY-AVERAGE-PRICE",
      "pages": [
        3555
      ],
      "kind": "price_quantity_reconciliation",
      "status": "independently_confirmed_unresolved_source_exception",
      "outside_narrative_assignment": true,
      "reported_shares_million": "107",
      "reported_average_EUR": "63.62",
      "reported_total_EUR_million": "6992",
      "computed_without_unidentified_costs_EUR_million": "6807.34",
      "action": "Cost includes unspecified transaction costs; rounding alone cannot explain residual. Do not invent fees or assume error."
    },
    {
      "id": "SCOPE3-PRIMARY-DATA-DENOMINATOR",
      "pages": [
        3384
      ],
      "kind": "denominator_ambiguity",
      "status": "retain_source_wording",
      "action": "24% supplier/partner data followed by of-this3% primary. Do not infer percentage-of-total without unambiguous denominator."
    }
  ]
};
export const MERCEDES_PRIMARY_ROWS = {
  "income": [
    {
      "label": "Revenue",
      "values": [
        132214.0,
        145594.0
      ],
      "displays": [
        "132,214",
        "145,594"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "42d9cd9f470a2aca3fbf93beffebcead9c92befe00789e2d912a667be310bab0",
      "id": "revenue"
    },
    {
      "label": "Cost of sales",
      "values": [
        -109881.0,
        -117018.0
      ],
      "displays": [
        "-109,881",
        "-117,018"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "a33ae4ed2a4de839480cf6a01e01e84fbe0a4d848264cc75c581f3e55ebdbe19",
      "id": "cost_sales"
    },
    {
      "label": "Gross profit in relation to revenue",
      "values": [
        22333.0,
        28576.0
      ],
      "displays": [
        "22,333",
        "28,576"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "3102b2f9545870298a6ef36259b6eeba61598ad9e2fae3a08da8a504d9972172",
      "id": "gross_profit"
    },
    {
      "label": "Selling expenses",
      "values": [
        -9718.0,
        -9993.0
      ],
      "displays": [
        "-9,718",
        "-9,993"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "6a672032f452c5656837c65343964716a8391f31500ac8f5f23e4141c663fbfc",
      "id": "selling"
    },
    {
      "label": "General administrative expenses",
      "values": [
        -2477.0,
        -2529.0
      ],
      "displays": [
        "-2,477",
        "-2,529"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "fedfadd4e9eba338514e884de4e7cd0df2012d144ca1e42d23155836a98bde75",
      "id": "administration"
    },
    {
      "label": "Research and non-capitalized development costs",
      "values": [
        -6055.0,
        -5580.0
      ],
      "displays": [
        "-6,055",
        "-5,580"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "92395fa1eb44c663c66b3b06a60de27c498ebffab42b9f0a09095c92aae29cb2",
      "id": "research_noncapitalized"
    },
    {
      "label": "Other operating income",
      "values": [
        1551.0,
        2507.0
      ],
      "displays": [
        "1,551",
        "2,507"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "67c35bf4c6a08f1c28e17bcf9d5c204634a3484f06435a4acb56ff07393af96a",
      "id": "other_operating_income"
    },
    {
      "label": "Other operating expense",
      "values": [
        -1025.0,
        -483.0
      ],
      "displays": [
        "-1,025",
        "-483"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "73773c14d301ec0add94d635792527e9389256cbeddd19eb1fe4e37f9d227b21",
      "id": "other_operating_expense"
    },
    {
      "label": "Gains/losses on equity-method investments, net",
      "values": [
        1118.0,
        1138.0
      ],
      "displays": [
        "1,118",
        "1,138"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "051564f8d733ac7a450dcbf62ff60c3fd8334b1b40987f4cf7d26f177e23f06a",
      "id": "equity_method"
    },
    {
      "label": "Other financial income/expense, net",
      "values": [
        93.0,
        -37.0
      ],
      "displays": [
        "93",
        "-37"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "866f4032fa9422d3ecc894c034e549782154afecbb68be0853d685b719c3cf47",
      "id": "other_financial"
    },
    {
      "label": "Earnings before interest and taxes (EBIT)",
      "values": [
        5820.0,
        13599.0
      ],
      "displays": [
        "5,820",
        "13,599"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "99a80045217fb47f5c3bb9df2ba1518b26655432669d0e6b06ab8b2e7784cc84",
      "id": "ebit"
    },
    {
      "label": "Interest income",
      "values": [
        623.0,
        738.0
      ],
      "displays": [
        "623",
        "738"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "3b1facc71ef6dbcecc20bd255a4128456b23fc09594fa39f8854a63b0a7f1fad",
      "id": "interest_income"
    },
    {
      "label": "Interest expense",
      "values": [
        -159.0,
        -190.0
      ],
      "displays": [
        "-159",
        "-190"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "b782ba7d63a7a53aa7bbf183e5028c8e59a618660de6d1c9cb9b2214df9490cd",
      "id": "interest_expense"
    },
    {
      "label": "Profit before income taxes",
      "values": [
        6284.0,
        14147.0
      ],
      "displays": [
        "6,284",
        "14,147"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "e56f3c36bd98a92275703fb64e3fd86ab083d9c52d5c3b7f15ddf70b1af1bd81",
      "id": "pretax"
    },
    {
      "label": "Income taxes",
      "values": [
        -953.0,
        -3738.0
      ],
      "displays": [
        "-953",
        "-3,738"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "7cb711017cddc89767531ad583ff7974bd6b176654d73164a542ddf4353ab83e",
      "id": "tax"
    },
    {
      "label": "Net profit",
      "values": [
        5331.0,
        10409.0
      ],
      "displays": [
        "5,331",
        "10,409"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "2b17e5aabc02208c63355dade3958fbf485d4fa46ef2ea96c1417ca84ea52668",
      "id": "net_profit"
    },
    {
      "label": "thereof profit attributable to non-controlling interests",
      "values": [
        190.0,
        202.0
      ],
      "displays": [
        "190",
        "202"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "be77d2802fc03b2781c089fecaf114f21c7e5ad884f263aaf801d50d14f92271",
      "id": "nci_profit"
    },
    {
      "label": "thereof share of the net profit attributable to shareholders of Mercedes-Benz Group AG",
      "values": [
        5141.0,
        10207.0
      ],
      "displays": [
        "5,141",
        "10,207"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "2450c677775ec7c5c2e0d16d443424270f52bed79242146e2b9e2b55a7663319",
      "id": "parent_profit"
    }
  ],
  "oci": [
    {
      "label": "Net profit",
      "values": [
        5331.0,
        10409.0
      ],
      "displays": [
        "5,331",
        "10,409"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "63af4b650b563f07cb9ef7136cad93c2d8cf7399c780b308c2f7d2b79363c1c3",
      "id": "net_profit"
    },
    {
      "label": "Gains/losses from currency translation",
      "values": [
        -1525.0,
        1001.0
      ],
      "displays": [
        "-1,525",
        "1,001"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "2eb1f0940b347728e7566f41d9c9e702f22e28adcdb9882f7edeae74f88ea601",
      "id": "currency_translation"
    },
    {
      "label": "Gains/losses on debt instruments",
      "values": [
        3.0,
        9.0
      ],
      "displays": [
        "3",
        "9"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "00168ac27298954284587f766cabc5358b2fbb837881c18824e30eea92e7abed",
      "id": "debt"
    },
    {
      "label": "Gains/losses on derivative financial instruments1",
      "values": [
        808.0,
        -1181.0
      ],
      "displays": [
        "808",
        "-1,181"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "a8d90e8074c7741bc0dcd16db0437e0d3fbb72965b43bf270a45691e9965cb74",
      "id": "derivatives"
    },
    {
      "label": "Gains/losses on equity-method investments",
      "values": [
        -508.0,
        3.0
      ],
      "displays": [
        "-508",
        "3"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "460c0ddd8d36039e644bbb3da71b11cd0bb8ee369acb355505149908ea47df2b",
      "id": "equity_method_reclassifiable"
    },
    {
      "label": "Items that may be reclassified to profit/loss in the Consolidated Statement of Income in the future",
      "values": [
        -1222.0,
        -168.0
      ],
      "displays": [
        "-1,222",
        "-168"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "e6daff2ad8caac629ace4061bc97484429e3b0ecc39000a969fcea447da1edda",
      "id": "reclassifiable_total"
    },
    {
      "label": "Actuarial gains/losses from pensions and similar obligations",
      "values": [
        1020.0,
        1045.0
      ],
      "displays": [
        "1,020",
        "1,045"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "cbd3f697636bf62cb4290ceb894b7df1bd971b1b3f2b91a020ca5ee1ef57494c",
      "id": "pensions"
    },
    {
      "label": "Gains/losses on equity instruments",
      "values": [
        -57.0,
        -126.0
      ],
      "displays": [
        "-57",
        "-126"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "00bbc32196e34cc10e0cc911973eac029fa18e0522aa3d4e6d1e5bb688bcd57f",
      "id": "equity"
    },
    {
      "label": "Gains/losses on equity-method investments",
      "values": [
        157.0,
        23.0
      ],
      "displays": [
        "157",
        "23"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "c027418b2b21b217e4ef86cd1b7bfe68537cca9a1eaee83f2f048944ef62e92c",
      "id": "equity_method_nonreclassifiable"
    },
    {
      "label": "Items that will not be reclassified to profit/loss in the Consolidated Statement of Income in the future",
      "values": [
        1120.0,
        942.0
      ],
      "displays": [
        "1,120",
        "942"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "596465127306e42043e534d0791ab19f9ef1d51c62f87b012d317e18ff1cf225",
      "id": "nonreclassifiable_total"
    },
    {
      "label": "Other comprehensive income/loss after taxes2",
      "values": [
        -102.0,
        774.0
      ],
      "displays": [
        "-102",
        "774"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "4080406ed5e0a56136352e1313c537d9a91351e85f96aa4aa5024205cff9124c",
      "id": "oci"
    },
    {
      "label": "thereof income/loss attributable to non-controlling interests after taxes",
      "values": [
        -114.0,
        5.0
      ],
      "displays": [
        "-114",
        "5"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "17f3c0ccd410d294ad7d8375bcdf772eb24e8b99b6f5cfa30992e84daa081d77",
      "id": "oci_nci"
    },
    {
      "label": "thereof income/loss attributable to shareholders of Mercedes-Benz Group AG after taxes",
      "values": [
        12.0,
        769.0
      ],
      "displays": [
        "12",
        "769"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "e31575e2d3fc8f3299a35ceea445b42b0f9bd6ed2c42548a46dd43924b236247",
      "id": "oci_parent"
    },
    {
      "label": "Total comprehensive income/loss",
      "values": [
        5229.0,
        11183.0
      ],
      "displays": [
        "5,229",
        "11,183"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "edcffb9436abcc73e0f227d2e367f0667783a5e6b8e3d5b8e2eb11b11eda7e2e",
      "id": "comprehensive"
    },
    {
      "label": "thereof income/loss attributable to non-controlling interests",
      "values": [
        76.0,
        207.0
      ],
      "displays": [
        "76",
        "207"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "b0e6452d7f44794199e7213ecfa94f156564742282fe7f0b2bf2ee9019f1d402",
      "id": "comprehensive_nci"
    },
    {
      "label": "thereof income/loss attributable to shareholders of Mercedes-Benz Group AG",
      "values": [
        5153.0,
        10976.0
      ],
      "displays": [
        "5,153",
        "10,976"
      ],
      "sourcePage": 3493,
      "sourceLineSha256": "f12934aea2a7b10e24b3a4eaa52a98f37bd3a34ec35dbce4a62cbe630d5998da",
      "id": "comprehensive_parent"
    }
  ],
  "assets": [
    {
      "label": "Intangible assets",
      "values": [
        20547.0,
        19436.0
      ],
      "displays": [
        "20,547",
        "19,436"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "bfdf826727bea84aaf2ba4e3960d7239afae04a3d604d63c3d136a6e28b988f7",
      "id": "intangible"
    },
    {
      "label": "Property, plant and equipment including right-of-use assets",
      "values": [
        27340.0,
        26537.0
      ],
      "displays": [
        "27,340",
        "26,537"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "7dbdbdfaa41b75e748c293462c1a44d6c0f3b021357bd92965d9391f41ebd422",
      "id": "ppe_rou"
    },
    {
      "label": "Equipment on operating leases",
      "values": [
        39472.0,
        45220.0
      ],
      "displays": [
        "39,472",
        "45,220"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "89c9add1244efe6609a183caff1cfc773248d167097333586aedb14fa6bf1eae",
      "id": "operating_leases"
    },
    {
      "label": "Equity-method investments",
      "values": [
        10037.0,
        12786.0
      ],
      "displays": [
        "10,037",
        "12,786"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "dd649ae8d407b54aad39c0f4bb3814dc5b6ae57fb8be49d0cadfef7a4ffdd49b",
      "id": "equity_method"
    },
    {
      "label": "Receivables from financial services",
      "values": [
        41902.0,
        48547.0
      ],
      "displays": [
        "41,902",
        "48,547"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "d7af8b5e5c3d3a452d3d06ea4b955a95aaaa5d83fa351fa18dd45417274935b8",
      "id": "fs_noncurrent"
    },
    {
      "label": "Marketable debt securities and similar investments",
      "values": [
        626.0,
        644.0
      ],
      "displays": [
        "626",
        "644"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "9ed617cd69a4eb138d7d775ffd8659406a6c9088babe79b52a72222c59fb5e47",
      "id": "securities_noncurrent"
    },
    {
      "label": "Other financial assets",
      "values": [
        2953.0,
        3020.0
      ],
      "displays": [
        "2,953",
        "3,020"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "a8e4e22db0c9e2ca77ca76b5fd592e1a877eb855756973ad200ed38cccfabfb1",
      "id": "other_financial_noncurrent"
    },
    {
      "label": "Deferred tax assets",
      "values": [
        6090.0,
        4335.0
      ],
      "displays": [
        "6,090",
        "4,335"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "35ca94e602d9331a30e0f25718051fe4e36225c17c5357730f41d414d8decb67",
      "id": "deferred_tax"
    },
    {
      "label": "Income tax assets",
      "values": [
        426.0,
        327.0
      ],
      "displays": [
        "426",
        "327"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "6699f6f651926d21b7383c6a1fe63b25196af6a4be4411e3271761568c585a46",
      "id": "income_tax_noncurrent"
    },
    {
      "label": "Other assets",
      "values": [
        3941.0,
        2391.0
      ],
      "displays": [
        "3,941",
        "2,391"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "93007f9e15c4fc4c031644a3675178ba4f5ba73abcd8a163347d3127f47911bc",
      "id": "other_noncurrent"
    },
    {
      "label": "Total non-current assets",
      "values": [
        153334.0,
        163243.0
      ],
      "displays": [
        "153,334",
        "163,243"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "9de2869875ceeea821c682be2828eef94d30bc1b329aa877ba5816469698c49c",
      "id": "noncurrent_total"
    },
    {
      "label": "Inventories",
      "values": [
        23933.0,
        26234.0
      ],
      "displays": [
        "23,933",
        "26,234"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "bdc6b4f480378343688b51a284e3d3931d8c0347104136a6cce4a59c4689b92b",
      "id": "inventory"
    },
    {
      "label": "Trade receivables",
      "values": [
        5851.0,
        6973.0
      ],
      "displays": [
        "5,851",
        "6,973"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "0d645a62b762dbac0bce7610bb5c23cf517f82b119427d4de422ed53fd096dd7",
      "id": "trade_receivables"
    },
    {
      "label": "Receivables from financial services",
      "values": [
        34387.0,
        39320.0
      ],
      "displays": [
        "34,387",
        "39,320"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "ff640ee75ee075df2c87503685df392be8c9f2e9e759b2dc2b2f668feee31927",
      "id": "fs_current"
    },
    {
      "label": "Cash and cash equivalents",
      "values": [
        12254.0,
        14511.0
      ],
      "displays": [
        "12,254",
        "14,511"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "37d3b9e78708301435d7a3fa7a0f13d886f86c88b7935f43304fb68c53f3ba60",
      "id": "cash"
    },
    {
      "label": "Marketable debt securities and similar investments",
      "values": [
        6940.0,
        7086.0
      ],
      "displays": [
        "6,940",
        "7,086"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "5cf4947a219c02c13facbba076dcb3ec69a7b3b2c13298156d8c42480d669db1",
      "id": "securities_current"
    },
    {
      "label": "Other financial assets",
      "values": [
        2852.0,
        2868.0
      ],
      "displays": [
        "2,852",
        "2,868"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "2e7824486c3d7bef072cbe262b6c7068d7c4248672849d30778acfd74b059907",
      "id": "other_financial_current"
    },
    {
      "label": "Income tax assets",
      "values": [
        1257.0,
        1034.0
      ],
      "displays": [
        "1,257",
        "1,034"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "5c1483c61754e65afaea2824dfdd4533f46c36d0079dd026c5af85fb7bd2dc8d",
      "id": "income_tax_current"
    },
    {
      "label": "Other assets",
      "values": [
        3645.0,
        3581.0
      ],
      "displays": [
        "3,645",
        "3,581"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "7242eb2c5ab4d95316d0ee6b6b1a57ef2bbdd6a95663109000dc4192f9630c98",
      "id": "other_current"
    },
    {
      "label": "Assets held for sale",
      "values": [
        11013.0,
        160.0
      ],
      "displays": [
        "11,013",
        "160"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "3369d70d6786c77365529058b3ec6648c6b5704a206fc69fb9d9ec9568fa16dd",
      "id": "held_for_sale"
    },
    {
      "label": "Total current assets",
      "values": [
        102132.0,
        101767.0
      ],
      "displays": [
        "102,132",
        "101,767"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "706ada45cb15b62f93d8c72a9d6c6968fa1a16d393917500370b5b9bfcccd7a2",
      "id": "current_total"
    },
    {
      "label": "Total assets",
      "values": [
        255466.0,
        265010.0
      ],
      "displays": [
        "255,466",
        "265,010"
      ],
      "sourcePage": 3494,
      "sourceLineSha256": "7120d1880424856dc2d3a98d01e9a8f30ab429504c077e1a68295c9094cc698c",
      "id": "total_assets"
    }
  ],
  "equity_liabilities": [
    {
      "label": "Share capital",
      "values": [
        3070.0,
        3070.0
      ],
      "displays": [
        "3,070",
        "3,070"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "5efe75b7220d409b196e38fcb6065c9658756ed96fe52887b78930ab46c4c8d0",
      "id": "share_capital"
    },
    {
      "label": "Capital reserves",
      "values": [
        11718.0,
        11718.0
      ],
      "displays": [
        "11,718",
        "11,718"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "fb0202105072fe13d4e7e58b4aa2caf944b3370282f33413bef449cd8a939b5a",
      "id": "capital_reserves"
    },
    {
      "label": "Retained earnings",
      "values": [
        77631.0,
        75469.0
      ],
      "displays": [
        "77,631",
        "75,469"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "47a2f4226fd9148c15c62218f32da11d1ffd278fd95062499e2724534836aca2",
      "id": "retained_earnings"
    },
    {
      "label": "Other reserves",
      "values": [
        1163.0,
        2368.0
      ],
      "displays": [
        "1,163",
        "2,368"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "7ad2fbb7d0634ccd9a194ebd271d377c6b50d12646f0ceed8ad38af340657d27",
      "id": "other_reserves"
    },
    {
      "label": "Treasury shares",
      "values": [
        -325.0,
        0
      ],
      "displays": [
        "-325",
        "–"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "94528e047d6af58bf0101d5b5e3e18e897ca1ddb11d44603a3cee1ed658695aa",
      "id": "treasury_shares"
    },
    {
      "label": "Equity attributable to shareholders of Mercedes-Benz Group AG",
      "values": [
        93257.0,
        92625.0
      ],
      "displays": [
        "93,257",
        "92,625"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "1f1c096927f0edfefa4bc318095c09bbd5090c0c2e771ceb6513de949f3c37e0",
      "id": "parent_equity"
    },
    {
      "label": "Non-controlling interests",
      "values": [
        983.0,
        1005.0
      ],
      "displays": [
        "983",
        "1,005"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "08c36140c2758e4e6ebd77793911c32aded7d3446019d484bac3dcbf6b8441f8",
      "id": "nci"
    },
    {
      "label": "Total equity",
      "values": [
        94240.0,
        93630.0
      ],
      "displays": [
        "94,240",
        "93,630"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "24172783f5c21b85dde3fa1d003ed9fc1d74428b4bf240baa6011dc6f72aba9c",
      "id": "equity"
    },
    {
      "label": "Provisions for pensions and similar obligations",
      "values": [
        807.0,
        952.0
      ],
      "displays": [
        "807",
        "952"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "9bc85fcdeb6455d53e30b7d6fc05ca56a9faeeefe749f0a15fca018269f79aeb",
      "id": "pension"
    },
    {
      "label": "Provisions for other risks",
      "values": [
        7612.0,
        7332.0
      ],
      "displays": [
        "7,612",
        "7,332"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "d2d4d9a6cea0f7392ebf5005a86b80ea5d7de1d228025a096e859bcf6f36acc0",
      "id": "provisions_noncurrent"
    },
    {
      "label": "Financing liabilities",
      "values": [
        62410.0,
        73487.0
      ],
      "displays": [
        "62,410",
        "73,487"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "87643b329273c23a9d4c89d6542bef3daccd4287ca525dd1ed2e474e6101aae5",
      "id": "debt_noncurrent"
    },
    {
      "label": "Other financial liabilities",
      "values": [
        1278.0,
        1490.0
      ],
      "displays": [
        "1,278",
        "1,490"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "b923fe55ace477284611fd97896a688019ac4bc3050f757fcecc208865d087d8",
      "id": "financial_noncurrent"
    },
    {
      "label": "Deferred tax liabilities",
      "values": [
        10201.0,
        7497.0
      ],
      "displays": [
        "10,201",
        "7,497"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "14a73603e83df97ebf91b77a668060a86b0691859005821652285ce788e5e019",
      "id": "deferred_tax"
    },
    {
      "label": "Contract and refund liabilities",
      "values": [
        2942.0,
        3100.0
      ],
      "displays": [
        "2,942",
        "3,100"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "c9c048fcd49bc18af85e070c54f9137943506bdf4a344f25a94cf001911fd97a",
      "id": "contract_refund_noncurrent"
    },
    {
      "label": "Income tax liabilities",
      "values": [
        1020.0,
        1342.0
      ],
      "displays": [
        "1,020",
        "1,342"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "a99ed0d104b57d924df9b2e363e25ad77bb3f6b6a51116d962bc8bdb223127d4",
      "id": "income_tax_noncurrent"
    },
    {
      "label": "Other liabilities",
      "values": [
        1188.0,
        1354.0
      ],
      "displays": [
        "1,188",
        "1,354"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "9ae8124eaf603869d40683a606b98582b19ccbe098ad684a645070cacddf2176",
      "id": "other_noncurrent"
    },
    {
      "label": "Total non-current liabilities",
      "values": [
        87458.0,
        96554.0
      ],
      "displays": [
        "87,458",
        "96,554"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "af49f30ad75d2574b0d8e5b8bd7abd48966ba33af2284b686af9005acecbf4bf",
      "id": "noncurrent_total"
    },
    {
      "label": "Trade payables",
      "values": [
        10665.0,
        11312.0
      ],
      "displays": [
        "10,665",
        "11,312"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "8ca21737bb88b5c9bcf12ff15e3b87891d9faed5970340a4d3cfd59afe74fec8",
      "id": "trade_payables"
    },
    {
      "label": "Provisions for other risks",
      "values": [
        7846.0,
        7688.0
      ],
      "displays": [
        "7,846",
        "7,688"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "c62181d5589303f3676a89ef25c50df0cc41a36c1e940527fd7fbefef35e48b0",
      "id": "provisions_current"
    },
    {
      "label": "Financing liabilities",
      "values": [
        37596.0,
        39311.0
      ],
      "displays": [
        "37,596",
        "39,311"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "3668a35ea117a718e536199d9686e92b0c10def6cf9b3842731ff2b1436e5140",
      "id": "debt_current"
    },
    {
      "label": "Other financial liabilities",
      "values": [
        4277.0,
        4071.0
      ],
      "displays": [
        "4,277",
        "4,071"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "1b2d7e64216e05dec9975d537962ef5c0161674df51896603d74137a11a50b78",
      "id": "financial_current"
    },
    {
      "label": "Contract and refund liabilities",
      "values": [
        7955.0,
        8146.0
      ],
      "displays": [
        "7,955",
        "8,146"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "24132d1edeaa5e0978d26b12026c78ab0a42c1a7ab9d59e506da9d023b5d8f02",
      "id": "contract_refund_current"
    },
    {
      "label": "Income tax liabilities",
      "values": [
        646.0,
        705.0
      ],
      "displays": [
        "646",
        "705"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "03b1dd15563a5bda6e11c994a8cf3ba303a1493513c37f5d4f0f79abeb724bc7",
      "id": "income_tax_current"
    },
    {
      "label": "Other liabilities",
      "values": [
        3443.0,
        3547.0
      ],
      "displays": [
        "3,443",
        "3,547"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "fa84ba06ab66b461e7d62417971c19d804878e6db54748c3791515dfc3b6b743",
      "id": "other_current"
    },
    {
      "label": "Liabilities held for sale",
      "values": [
        1340.0,
        46.0
      ],
      "displays": [
        "1,340",
        "46"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "29664bbf7126d5fd1d2381dadc839a5e703c1698005a5cb930b254b3e5b9023f",
      "id": "held_for_sale"
    },
    {
      "label": "Total current liabilities",
      "values": [
        73768.0,
        74826.0
      ],
      "displays": [
        "73,768",
        "74,826"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "690b05432e80942570bfbc3400bbff097005233a2dfdb9df9efcf5ce195a93c7",
      "id": "current_total"
    },
    {
      "label": "Total equity and liabilities",
      "values": [
        255466.0,
        265010.0
      ],
      "displays": [
        "255,466",
        "265,010"
      ],
      "sourcePage": 3495,
      "sourceLineSha256": "530ccf266d4f4607ffcb9b78fa074da3b029792f29860e0ac28f15bb20aa27c6",
      "id": "total_equity_liabilities"
    }
  ],
  "eps": [
    {
      "label": "Basic",
      "values": [
        5.34,
        10.19
      ],
      "displays": [
        "5.34",
        "10.19"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "ef660d75ba0611a7ba145735fcc1ab4770ae5cc366d403a884ee81c1e9af97ef",
      "id": "basic"
    },
    {
      "label": "Diluted",
      "values": [
        5.34,
        10.19
      ],
      "displays": [
        "5.34",
        "10.19"
      ],
      "sourcePage": 3492,
      "sourceLineSha256": "1da3a332edd1c8849855b0a18b61c7810d84e4c73d7121cf4d16cc851b98bcbe",
      "id": "diluted"
    }
  ],
  "cash_flow": [
    {
      "label": "Profit before income taxes",
      "values": [
        6284.0,
        14147.0
      ],
      "displays": [
        "6,284",
        "14,147"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "406da247278b9047d744ed25737327d7e5c1d911b6a8fb743ef50d04ee708f70",
      "id": "pretax"
    },
    {
      "label": "Depreciation and amortization/impairments",
      "values": [
        7223.0,
        6772.0
      ],
      "displays": [
        "7,223",
        "6,772"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "d4eb351b11e9da69fa3730b6d2a12581b1f5b19f662d43909d79f6dce477d3e1",
      "id": "da_impairment"
    },
    {
      "label": "Other non-cash expense and income",
      "values": [
        -1204.0,
        -1362.0
      ],
      "displays": [
        "-1,204",
        "-1,362"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "deb99c6723419ff814f9f5774dbdd6d0eb7f8e5778125c98dfcbec2b6828fe7d",
      "id": "other_noncash"
    },
    {
      "label": "Gains (-)/losses (+) from disposals of non-current assets",
      "values": [
        65.0,
        18.0
      ],
      "displays": [
        "65",
        "18"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "937479b2bf1f60254a9e2e6c706a2118ee9c28c1386534236b794598fc349c26",
      "id": "disposal_gains_losses"
    },
    {
      "label": "Inventories",
      "values": [
        724.0,
        737.0
      ],
      "displays": [
        "724",
        "737"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "1748316416cb702faceb1b3a27e8141113da7d9f0f512b39dde9a04bab9c3059",
      "id": "inventory_change"
    },
    {
      "label": "Trade receivables and trade payables",
      "values": [
        895.0,
        -1199.0
      ],
      "displays": [
        "895",
        "-1,199"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "cc6bfcbc729285e1bc2a64bebc842addebdd0e24ad41f5bfac78906aa25ee838",
      "id": "trade_change"
    },
    {
      "label": "Receivables from financial services",
      "values": [
        5828.0,
        3280.0
      ],
      "displays": [
        "5,828",
        "3,280"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "08dc9e5a127418abc8fde8fbc103e33cbf636d7116f65d62ce0777c62726f6e7",
      "id": "fs_receivable_change"
    },
    {
      "label": "Vehicles on operating leases",
      "values": [
        -4060.0,
        -3110.0
      ],
      "displays": [
        "-4,060",
        "-3,110"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "f83a4b4704747686c48067d9c3edaaaf0c06f5723038a22d85a2a059c0cdec63",
      "id": "leased_vehicle_change"
    },
    {
      "label": "Other operating assets and liabilities",
      "values": [
        2585.0,
        986.0
      ],
      "displays": [
        "2,585",
        "986"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "d586d25fc5afcc991c437ffd4b7753ab69b0af4b5bd65f48a59f9e1418807bba",
      "id": "other_operating_change"
    },
    {
      "label": "Dividends received from equity-method investments",
      "values": [
        1330.0,
        1918.0
      ],
      "displays": [
        "1,330",
        "1,918"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "45adf1546d25a05ba2749d74f4c29b0c30f9c37cefa75a788116e51063d8069d",
      "id": "equity_method_dividends"
    },
    {
      "label": "Income taxes paid",
      "values": [
        -1664.0,
        -4452.0
      ],
      "displays": [
        "-1,664",
        "-4,452"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "b963c44b82317ec5337cc28634ce44ef5b4dfed2eff630ca2cae28e2ed63d0c4",
      "id": "tax_paid"
    },
    {
      "label": "Cash flow from operating activities",
      "values": [
        18006.0,
        17735.0
      ],
      "displays": [
        "18,006",
        "17,735"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "bb2716d598f5312a547f36b55911adcc52a4bbbaddaf657c3361150536c9a8f2",
      "id": "cfo"
    },
    {
      "label": "Acquisitions of property, plant and equipment",
      "values": [
        -5482.0,
        -4039.0
      ],
      "displays": [
        "-5,482",
        "-4,039"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "2f875d6a141f1eb533daddb18cbe78bc141be32363d3b37c65a03b8c497b3533",
      "id": "ppe_acquisition"
    },
    {
      "label": "Acquisitions of intangible assets",
      "values": [
        -4260.0,
        -4626.0
      ],
      "displays": [
        "-4,260",
        "-4,626"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "e375555d6d695ad089ff9b5c692f9c38e74ce3dfada04de665f11bc3bb1c7ff8",
      "id": "intangible_acquisition"
    },
    {
      "label": "Cash inflows from disposals of property, plant and equipment and intangible assets",
      "values": [
        191.0,
        188.0
      ],
      "displays": [
        "191",
        "188"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "18706fd260b711d0239fafe9ba068c6314f10dcb0731738d605a7c2fd4da320c",
      "id": "ppe_intangible_disposal"
    },
    {
      "label": "Acquisitions of shareholdings",
      "values": [
        -304.0,
        -363.0
      ],
      "displays": [
        "-304",
        "-363"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "7aaee0bd769369dbf8518ffbad97e9c07fa2b4fcb03824ec10ce4d03e553bff6",
      "id": "shareholding_acquisition"
    },
    {
      "label": "Cash inflows from disposals of shareholdings and other business operations",
      "values": [
        413.0,
        716.0
      ],
      "displays": [
        "413",
        "716"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "38598da10d6f094a67e922fa8ab6e79080da6976affc40c21523e1e9eec63665",
      "id": "shareholding_disposal"
    },
    {
      "label": "Acquisitions of marketable debt securities and similar investments",
      "values": [
        -12303.0,
        -6785.0
      ],
      "displays": [
        "-12,303",
        "-6,785"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "c2e8e011590da3a21ab655297b26870b91fceef6dc470f06d9b49caaa46a53c0",
      "id": "securities_acquisition"
    },
    {
      "label": "Cash inflows from sales of marketable debt securities and similar investments",
      "values": [
        12557.0,
        6160.0
      ],
      "displays": [
        "12,557",
        "6,160"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "24180be8e886189117e39daa45ffbf301c3274851e73645d7a9afad025a33f1f",
      "id": "securities_disposal"
    },
    {
      "label": "Other cash flows",
      "values": [
        -12.0,
        -1.0
      ],
      "displays": [
        "-12",
        "-1"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "272b602ed2111b05cacf77771e4785d6e33c159398d55bb746b247cbd8d16f39",
      "id": "other_investing"
    },
    {
      "label": "Cash flow from investing activities",
      "values": [
        -9200.0,
        -8750.0
      ],
      "displays": [
        "-9,200",
        "-8,750"
      ],
      "sourcePage": 3496,
      "sourceLineSha256": "093c1cc8dc9945a985349a591e6bf1c9b2571240123316ea5fa5f90dde3effd9",
      "id": "cfi"
    },
    {
      "label": "Change in short-term financing liabilities",
      "values": [
        -3558.0,
        -3171.0
      ],
      "displays": [
        "-3,558",
        "-3,171"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "f27ad7db9f4d6b4a77eef42370ab19a58c83de4a43ca658ca0ae85b443d80ba9",
      "id": "short_financing_change"
    },
    {
      "label": "Additions to long-term financing liabilities",
      "values": [
        28598.0,
        38338.0
      ],
      "displays": [
        "28,598",
        "38,338"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "65d804b3c455ddca19433150e71521a011f34f7f6961354a001d9c971c50bb87",
      "id": "long_financing_additions"
    },
    {
      "label": "Repayment of long-term financing liabilities",
      "values": [
        -30970.0,
        -35355.0
      ],
      "displays": [
        "-30,970",
        "-35,355"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "ea55006c5fd6aa517f26ab36947d542ce4ff308b4d3006077f227d5c4906d7e5",
      "id": "long_financing_repayment"
    },
    {
      "label": "Dividend paid to shareholders of Mercedes-Benz Group AG",
      "values": [
        -4140.0,
        -5486.0
      ],
      "displays": [
        "-4,140",
        "-5,486"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "366df4ed1c6bd4ed360edaef167a2451e1c7ef829227ece52b3d7471775cd87b",
      "id": "parent_dividend"
    },
    {
      "label": "Dividends paid to non-controlling interests",
      "values": [
        -183.0,
        -239.0
      ],
      "displays": [
        "-183",
        "-239"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "6323bf64fd0a563f72fa94d49920dceca53a66e4ba0b0106b18aadf56822659a",
      "id": "nci_dividend"
    },
    {
      "label": "Acquisition of treasury shares",
      "values": [
        -360.0,
        -4921.0
      ],
      "displays": [
        "-360",
        "-4,921"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "cf365af3049bb1ce30588b2015cdfac4656f19956b423d10813fedd8a593d0ee",
      "id": "treasury_purchase_cash"
    },
    {
      "label": "Other cash inflows",
      "values": [
        160.0,
        82.0
      ],
      "displays": [
        "160",
        "82"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "1f4109289f4eafa6f7b88275e2e2e97d7f647b329a64a0d42c98a1bf0a60e706",
      "id": "other_financing"
    },
    {
      "label": "Cash flow from financing activities",
      "values": [
        -10453.0,
        -10752.0
      ],
      "displays": [
        "-10,453",
        "-10,752"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "194cdf3886335e5c009a3f44fbf5446d8afe3dfbb08c75b7c77bccb6fd0d42c6",
      "id": "cff"
    },
    {
      "label": "Effect of foreign exchange-rate changes on cash and cash equivalents",
      "values": [
        -593.0,
        311.0
      ],
      "displays": [
        "-593",
        "311"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "5ca3b7986da6a9fd91c3f89065782f00d4efbe762d80a754f23e1147be0df022",
      "id": "fx"
    },
    {
      "label": "Change in cash and cash equivalents",
      "values": [
        -2240.0,
        -1456.0
      ],
      "displays": [
        "-2,240",
        "-1,456"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "92c2e2e49d024e1639876d9f5661bde9a1be7fd075bb55e7fb6a85be3abb1f5d",
      "id": "cash_change"
    },
    {
      "label": "Cash and cash equivalents at beginning of year",
      "values": [
        14516.0,
        15972.0
      ],
      "displays": [
        "14,516",
        "15,972"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "dc03a46d4c5555f86f28c3018b392b28cc0f5fc659558bf3aa0a014661300c30",
      "id": "opening_total"
    },
    {
      "label": "less cash and cash equivalents classified as assets held for sale at beginning of year",
      "values": [
        5.0,
        10.0
      ],
      "displays": [
        "5",
        "10"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "0d35ee9a6f5df8fc6a7655f5b8a37f3b5db651536181c67e34cad817a3ac6e56",
      "id": "opening_hfs"
    },
    {
      "label": "Cash and cash equivalents at beginning of year (Consolidated Statement of Financial Position)",
      "values": [
        14511.0,
        15962.0
      ],
      "displays": [
        "14,511",
        "15,962"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "56819524bc1c2d6be2e91edd1c86a26020df4f592e04514ca59abe4f8edaa75e",
      "id": "opening_balance_sheet"
    },
    {
      "label": "Cash and cash equivalents at end of year",
      "values": [
        12276.0,
        14516.0
      ],
      "displays": [
        "12,276",
        "14,516"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "61f8958b46e1909131e9c2edb13f91064671b61996dc0127919d8f87fb72fb02",
      "id": "closing_total"
    },
    {
      "label": "less cash and cash equivalents classified as assets held for sale at end of year",
      "values": [
        22.0,
        5.0
      ],
      "displays": [
        "22",
        "5"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "a8e7fa39e59c62f24588286bcf7e14de161d8882424fb44aab456b2173cc1690",
      "id": "closing_hfs"
    },
    {
      "label": "Cash and cash equivalents at end of year (Consolidated Statement of Financial Position)",
      "values": [
        12254.0,
        14511.0
      ],
      "displays": [
        "12,254",
        "14,511"
      ],
      "sourcePage": 3497,
      "sourceLineSha256": "f7881e4f1f89ba4c7e13725aed744eaab5a90789cee83b0c15af674dc6206a10",
      "id": "closing_balance_sheet"
    }
  ],
  "equity_2024": [
    {
      "label": "Balance at 1 January 2024",
      "values": [
        3070.0,
        11718.0,
        76670.0,
        1199.0,
        -142.0,
        1514.0,
        -2256.0,
        91773.0,
        1043.0,
        92816.0
      ],
      "displays": [
        "3,070",
        "11,718",
        "76,670",
        "1,199",
        "-142",
        "1,514",
        "-2,256",
        "91,773",
        "1,043",
        "92,816"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "a114729bd3e7325a3ae6d8b63967a87b82baa5947c69e8b7a85fb554f826097a",
      "id": "opening"
    },
    {
      "label": "Net profit",
      "values": [
        0,
        0,
        10207.0,
        0,
        0,
        0,
        0,
        10207.0,
        202.0,
        10409.0
      ],
      "displays": [
        "–",
        "–",
        "10,207",
        "–",
        "–",
        "–",
        "–",
        "10,207",
        "202",
        "10,409"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "8c8b7824fcde793ff321f50bf6162ca79d1e254ff23231295c25aae02aad2c01",
      "id": "net_profit"
    },
    {
      "label": "Other comprehensive income/loss after taxes",
      "values": [
        0,
        0,
        1045.0,
        1048.0,
        -93.0,
        -1231.0,
        0,
        769.0,
        5.0,
        774.0
      ],
      "displays": [
        "–",
        "–",
        "1,045",
        "1,048",
        "-93",
        "-1,231",
        "–",
        "769",
        "5",
        "774"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "577275a1cecfb2261f46da28b824bb4a4c1f15b675f8d1d25cd8ddf546cd0a45",
      "id": "oci"
    },
    {
      "label": "Total comprehensive income/loss",
      "values": [
        0,
        0,
        11252.0,
        1048.0,
        -93.0,
        -1231.0,
        0,
        10976.0,
        207.0,
        11183.0
      ],
      "displays": [
        "–",
        "–",
        "11,252",
        "1,048",
        "-93",
        "-1,231",
        "–",
        "10,976",
        "207",
        "11,183"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "8b10c12695fe3738935b24d8f5c76a41361b7ba07683124bfd10ab155d674c78",
      "id": "comprehensive"
    },
    {
      "label": "Dividends",
      "values": [
        0,
        0,
        -5486.0,
        0,
        0,
        0,
        0,
        -5486.0,
        -242.0,
        -5728.0
      ],
      "displays": [
        "–",
        "–",
        "-5,486",
        "–",
        "–",
        "–",
        "–",
        "-5,486",
        "-242",
        "-5,728"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "49a213d4679cba328619bb0336bf83a71a3bdbf9818a47d62970ae1f9bb1f48a",
      "id": "dividends"
    },
    {
      "label": "Changes in the consolidated group",
      "values": [
        0,
        0,
        138.0,
        0,
        0,
        0,
        0,
        138.0,
        -10.0,
        128.0
      ],
      "displays": [
        "–",
        "–",
        "138",
        "–",
        "–",
        "–",
        "–",
        "138",
        "-10",
        "128"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "b76a7910be28436b53a1f392b3681daed517c57bf24b06c4d6fd1307359e24b1",
      "id": "scope_changes"
    },
    {
      "label": "Capital increase",
      "values": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5.0,
        5.0
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
        "5",
        "5"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "2e0b13d110bcef439e4929f48cc640c0934f37e331d92f8706666a30eb147f57",
      "id": "capital_increase"
    },
    {
      "label": "Acquisition of treasury shares",
      "values": [
        0,
        0,
        0,
        0,
        0,
        0,
        -4809.0,
        -4809.0,
        0,
        -4809.0
      ],
      "displays": [
        "–",
        "–",
        "–",
        "–",
        "–",
        "–",
        "-4,809",
        "-4,809",
        "–",
        "-4,809"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "fdd68b18dc5977b2ddba1356c3ca9a4104b24a591144541f9f2b2f1b7feb7ca1",
      "id": "treasury_purchase_accrual"
    },
    {
      "label": "Issue and disposal of treasury shares",
      "values": [
        0,
        0,
        -6992.0,
        0,
        0,
        0,
        7065.0,
        73.0,
        0,
        73.0
      ],
      "displays": [
        "–",
        "–",
        "-6,992",
        "–",
        "–",
        "–",
        "7,065",
        "73",
        "–",
        "73"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "f2abad4e3ea6e58643e9f98b62fd82b3163a85417effb9bf4e791f86101eacfc",
      "id": "treasury_issue"
    },
    {
      "label": "Other",
      "values": [
        0,
        0,
        -113.0,
        0,
        87.0,
        -14.0,
        0,
        -40.0,
        2.0,
        -38.0
      ],
      "displays": [
        "–",
        "–",
        "-113",
        "–",
        "87",
        "-14",
        "–",
        "-40",
        "2",
        "-38"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "a44183d7e9a403efda4eb75b1874a8efa2ebdf6292c98d903a99c96f2007d164",
      "id": "other"
    },
    {
      "label": "Balance at 31 December 2024",
      "values": [
        3070.0,
        11718.0,
        75469.0,
        2247.0,
        -148.0,
        269.0,
        0,
        92625.0,
        1005.0,
        93630.0
      ],
      "displays": [
        "3,070",
        "11,718",
        "75,469",
        "2,247",
        "-148",
        "269",
        "–",
        "92,625",
        "1,005",
        "93,630"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "35215def49cf1c8e1c050b5fe4c18dc36545bc5cf742a6d41f06fc4fe9bc8821",
      "id": "closing"
    }
  ],
  "equity_2025": [
    {
      "label": "Balance at 1 January 2025",
      "values": [
        3070.0,
        11718.0,
        75469.0,
        2247.0,
        -148.0,
        269.0,
        0,
        92625.0,
        1005.0,
        93630.0
      ],
      "displays": [
        "3,070",
        "11,718",
        "75,469",
        "2,247",
        "-148",
        "269",
        "–",
        "92,625",
        "1,005",
        "93,630"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "d793f99d4d146f22c1c6458a1e86a16e8ed3b925ee8e1ce23ac11e38f9682121",
      "id": "opening"
    },
    {
      "label": "Net profit",
      "values": [
        0,
        0,
        5141.0,
        0,
        0,
        0,
        0,
        5141.0,
        190.0,
        5331.0
      ],
      "displays": [
        "–",
        "–",
        "5,141",
        "–",
        "–",
        "–",
        "–",
        "5,141",
        "190",
        "5,331"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "ab84afded7c5ac54156f2082486d0912d27cb276d6303fbb71061371857a64bf",
      "id": "net_profit"
    },
    {
      "label": "Other comprehensive income/loss after taxes",
      "values": [
        0,
        0,
        1174.0,
        -1967.0,
        -53.0,
        858.0,
        0,
        12.0,
        -114.0,
        -102.0
      ],
      "displays": [
        "–",
        "–",
        "1,174",
        "-1,967",
        "-53",
        "858",
        "–",
        "12",
        "-114",
        "-102"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "abf539f9e0aa855f95a52846cdce6542ee087fcbe55db49a3a9823abfb71b62b",
      "id": "oci"
    },
    {
      "label": "Total comprehensive income/loss",
      "values": [
        0,
        0,
        6315.0,
        -1967.0,
        -53.0,
        858.0,
        0,
        5153.0,
        76.0,
        5229.0
      ],
      "displays": [
        "–",
        "–",
        "6,315",
        "-1,967",
        "-53",
        "858",
        "–",
        "5,153",
        "76",
        "5,229"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "17b03549e0beaf12c4bb54fe0e04cf0689662ef17835964195e6f7a40d297533",
      "id": "comprehensive"
    },
    {
      "label": "Dividends",
      "values": [
        0,
        0,
        -4140.0,
        0,
        0,
        0,
        0,
        -4140.0,
        -185.0,
        -4325.0
      ],
      "displays": [
        "–",
        "–",
        "-4,140",
        "–",
        "–",
        "–",
        "–",
        "-4,140",
        "-185",
        "-4,325"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "18759818816d93293bc06029997d5df8234455825db4cc6a5b7213c30590f4b3",
      "id": "dividends"
    },
    {
      "label": "Changes in the consolidated group",
      "values": [
        0,
        0,
        4.0,
        0,
        0,
        0,
        0,
        4.0,
        0,
        4.0
      ],
      "displays": [
        "–",
        "–",
        "4",
        "–",
        "–",
        "–",
        "–",
        "4",
        "–",
        "4"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "72d90d83d266313f3fb38bcaf673b7d5c955a22f6fdd06352b154494900cffec",
      "id": "scope_changes"
    },
    {
      "label": "Capital increase",
      "values": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        89.0,
        89.0
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
        "89",
        "89"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "9242ab8e2c555276fc153a6357c7c1cc64f8d191b24af34898b484189a8765f3",
      "id": "capital_increase"
    },
    {
      "label": "Acquisition of treasury shares",
      "values": [
        0,
        0,
        0,
        0,
        0,
        0,
        -381.0,
        -381.0,
        0,
        -381.0
      ],
      "displays": [
        "–",
        "–",
        "–",
        "–",
        "–",
        "–",
        "-381",
        "-381",
        "–",
        "-381"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "584e95e2a904d6e247d0fc547786ae2234b4db33212c116372e81ffd3b5e5b66",
      "id": "treasury_purchase_accrual"
    },
    {
      "label": "Issue and disposal of treasury shares",
      "values": [
        0,
        0,
        0,
        0,
        0,
        0,
        56.0,
        56.0,
        0,
        56.0
      ],
      "displays": [
        "–",
        "–",
        "–",
        "–",
        "–",
        "–",
        "56",
        "56",
        "–",
        "56"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "ef9cff5527072f28247c23a01314b0509353295f5d20db8f8255a4626d2cb06a",
      "id": "treasury_issue"
    },
    {
      "label": "Other",
      "values": [
        0,
        0,
        -17.0,
        0,
        -12.0,
        -31.0,
        0,
        -60.0,
        -2.0,
        -62.0
      ],
      "displays": [
        "–",
        "–",
        "-17",
        "–",
        "-12",
        "-31",
        "–",
        "-60",
        "-2",
        "-62"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "1406eb5d40d5c035834e020153fcb89987f5b325674e5f71fc380b0e5285d69f",
      "id": "other"
    },
    {
      "label": "Balance at 31 December 2025",
      "values": [
        3070.0,
        11718.0,
        77631.0,
        280.0,
        -213.0,
        1096.0,
        -325.0,
        93257.0,
        983.0,
        94240.0
      ],
      "displays": [
        "3,070",
        "11,718",
        "77,631",
        "280",
        "-213",
        "1,096",
        "-325",
        "93,257",
        "983",
        "94,240"
      ],
      "sourcePage": 3498,
      "sourceLineSha256": "3fb4a3e18ef63c7957877f1f1ce3f974e083be70d3bdd6fbf977f14c5e37654d",
      "id": "closing"
    }
  ]
};

// Canonical reviewed values must not be changed by another importer.
function deepFreezeReviewed(value:unknown):void {
 if(value && typeof value==='object' && !Object.isFrozen(value)){
  for(const child of Object.values(value))deepFreezeReviewed(child);
  Object.freeze(value);
 }
}
deepFreezeReviewed(MERCEDES_REVIEWED);
deepFreezeReviewed(MERCEDES_PRIMARY_ROWS);
