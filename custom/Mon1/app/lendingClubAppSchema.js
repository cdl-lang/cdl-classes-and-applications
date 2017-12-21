// Copyright 2017 Yoav Seginer, Theo Vosse, Gil Harari, and Uri Kolodny.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


var lendingClubAppSchema = {
    LendingClubAppSchema: {
        "class": "PreLoadedApp",
        context: {
            name: "Lending Club Screener",
            productName: [concatStr, // override default in FSApp
                o(
                    [{ companyName: _ }, [me]],
                    [{ name: _ }, [me]]
                ),
                " "
            ],
            dataSourceProvider: "Lending Club",
            itemUniqueID: "recordId",
            defaultFrozenFacetUniqueIDs: o("recordId"),
            defaultMovingFacetUniqueIDs: o("loan_amnt", "annual_inc", "int_rate"),
            //defaultLoadedDataSourceName is now defined in PreLoadedApp

            excludedDataSourceFacetUniqueIDs: o(
                "pymnt_plan",
                "url",
                "desc"
            ),

            // dataSourceFacetDataOrdering can be an ordering of a subset - what is left out will be sorted by default by the order in which it appears in the database.
            dataSourceFacetDataOrdering: o(
            ),
            dataConfig: {
                // sort these objects alphabetically by the uniqueID, to ensure there are no duplicate objects referring to the same facet!
                facetObjects: o(
                    {
                        uniqueID: "acc_now_delinq",
                        tooltipText: "The number of accounts on which the borrower is now delinquent"
                    },
                    {
                        uniqueID: "acc_open_past_24mths",
                        tooltipText: "Number of trades opened in past 24 months"
                    },
                    {
                        uniqueID: "addr_state",
                        tooltipText: "The state provided by the borrower in the loan application"
                    },
                    {
                        uniqueID: "all_util",
                        tooltipText: "Balance to credit limit on all trades"
                    },
                    {
                        uniqueID: "annual_inc",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "The self-reported annual income provided by the borrower during registration"
                    },
                    {
                        uniqueID: "annual_inc_joint",
                        tooltipText: "The combined self-reported annual income provided by the co-borrowers during registration"
                    },
                    {
                        uniqueID: "application_type",
                        tooltipText: "Indicates whether the loan is an individual application or a joint application with two co-borrowers"
                    },
                    {
                        uniqueID: "avg_cur_bal",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Average current balance of all accounts"
                    },
                    {
                        uniqueID: "bc_open_to_buy",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total open to buy on revolving bankcards"
                    },
                    {
                        uniqueID: "bc_util",
                        tooltipText: "Ratio of total current balance to high credit/ credit limit for all bankcard accounts"
                    },
                    {
                        uniqueID: "chargeoff_within_12_mths",
                        tooltipText: "Number of charge-offs within 12 months"
                    },
                    {
                        uniqueID: "collection_recovery_fee",
                        tooltipText: "post charge off collection fee"
                    },
                    {
                        uniqueID: "collections_12_mths_ex_med",
                        tooltipText: "Number of collections in 12 months excluding medical collections"
                    },
                    {
                        uniqueID: "delinq_2yrs",
                        tooltipText: "The number of 30+ days past-due incidences of delinquency in the borrower's credit file for the past 2 years"
                    },
                    {
                        uniqueID: "delinq_amnt",
                        tooltipText: "The past-due amount owed for the accounts on which the borrower is now delinquent"
                    },
                    {
                        uniqueID: "desc",
                        tooltipText: "Loan description provided by the borrower"
                    },
                    {
                        uniqueID: "dti",
                        tooltipText: "A ratio calculated using the borrower’s total monthly debt payments on the total debt obligations, excluding mortgage and the requested LC loan, divided by the borrower’s self-reported monthly income"
                    },            	            	                    
                    {
                        uniqueID: "dti_joint",
                        tooltipText: "A ratio calculated using the co-borrowers' total monthly payments on the total debt obligations, excluding mortgages and the requested LC loan, divided by the co-borrowers' combined self-reported monthly income"
                    },
                    {
                        uniqueID: "earliest_cr_line",
                        tooltipText: "The month the borrower's earliest reported credit line was opened"
                    },                                        
                    {
                        uniqueID: "emp_length",
                        tooltipText: "Employment length in years. Possible values are between 0 and 10 where 0 means less than one year and 10 means ten or more years"
                    },
                    {
                        uniqueID: "emp_title",
                        tooltipText: "The job title supplied by the Borrower when applying for the loan"
                    },                                        
                    {
                        uniqueID: "fico_range_high",
                        tooltipText: "The upper boundary range the borrower’s FICO at loan origination belongs to"
                    },
                    {
                        uniqueID: "fico_range_low",
                        tooltipText: "The lower boundary range the borrower’s FICO at loan origination belongs to"
                    },          
                    {
                        uniqueID: "funded_amnt",
                        tooltipText: "The total amount committed to that loan at that point in time",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD"                        
                    },
                    {
                        uniqueID: "funded_amnt_inv",
                        tooltipText: "The total amount committed by investors for that loan at that point in time",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD"
                    },                    
                    {
                        uniqueID: "grade",
                        tooltipText: "LC assigned loan grade"
                    },
                    {
                        uniqueID: "home_ownership",
                        tooltipText: "The home ownership status provided by the borrower during registration or obtained from the credit report. Our values are: RENT, OWN, MORTGAGE, OTHER"
                    },            	
                    {
                        uniqueID: "id",
                        defaultDataType: fsAppConstants.dataTypeStringLabel,
                        tooltipText: "A unique LC assigned ID for the loan listing"
                    },
                    {
                        uniqueID: "il_util",
                        tooltipText: "Ratio of total current balance to high credit/credit limit on all install acct"
                    },
                    {
                        uniqueID: "initial_list_status",
                        tooltipText: "The initial listing status of the loan. Possible values are – W, F"
                    },
                    {
                        uniqueID: "inq_fi",
                        tooltipText: "Number of personal finance inquiries"
                    },
                    {
                        uniqueID: "inq_last_12m",
                        tooltipText: "Number of credit inquiries in past 12 months"
                    },
                    {
                        uniqueID: "inq_last_6mths",
                        tooltipText: "The number of inquiries in past 6 months (excluding auto and mortgage inquiries)"
                    },
                    {
                        uniqueID: "installment",
                        tooltipText: "The monthly payment owed by the borrower if the loan originates"
                    },
                    {
                        uniqueID: "int_rate",
                        tooltipText: "Interest Rate on the loan"
                        //percent: true doesn't work just yet!
                    },            	
                    {
                        uniqueID: "issue_d",
                        tooltipText: "The month which the loan was funded"
                    },
                    {
                        uniqueID: "last_credit_pull_d",
                        tooltipText: "The most recent month LC pulled credit for this loan"
                    },
                    {
                        uniqueID: "last_fico_range_high",
                        tooltipText: "The upper boundary range the borrower’s last FICO pulled belongs to"
                    },
                    {
                        uniqueID: "last_fico_range_low",
                        tooltipText: "The lower boundary range the borrower’s last FICO pulled belongs to"
                    },
                    {
                        uniqueID: "last_pymnt_amnt",
                        tooltipText: "Last total payment amount received"
                    },
                    {
                        uniqueID: "last_pymnt_d",
                        tooltipText: "Last month payment was received"
                    },
                    {
                        uniqueID: "loan_status",
                        tooltipText: "Current status of the loan"
                    },                                        
                    {
                        uniqueID: "loan_amnt",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "The listed amount of the loan applied for by the borrower. If at some point in time, the credit department reduces the loan amount, then it will be reflected in this value."
                    },
                    {
                        uniqueID: "max_bal_bc",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Maximum current balance owed on all revolving accounts"
                    },
                    {
                        uniqueID: "member_id",
                        defaultDataType: fsAppConstants.dataTypeStringLabel,
                        tooltipText: "A unique LC assigned Id for the borrower member"
                    },
                    {
                        uniqueID: "mo_sin_old_il_acct",
                        tooltipText: "Months since oldest bank installment account opened"
                    },
                    {
                        uniqueID: "mo_sin_old_rev_tl_op",
                        tooltipText: "Months since oldest revolving account opened"
                    },
                    {
                        uniqueID: "mo_sin_rcnt_rev_tl_op",
                        tooltipText: "Months since most recent revolving account opened"
                    },
                    {
                        uniqueID: "mo_sin_rcnt_tl",
                        tooltipText: "Months since most recent account opened"
                    },
                    {
                        uniqueID: "mort_acc",
                        tooltipText: "Number of mortgage accounts"
                    },
                    {
                        uniqueID: "mths_since_last_delinq",
                        tooltipText: "The number of months since the borrower's last delinquency"
                    },
                    {
                        uniqueID: "mths_since_last_major_derog",
                        tooltipText: "Months since most recent 90-day or worse rating"
                    },
                    {
                        uniqueID: "mths_since_last_record",
                        tooltipText: "The number of months since the last public record"
                    },
                    {
                        uniqueID: "mths_since_rcnt_il",
                        tooltipText: "Months since most recent installment accounts opened"
                    },
                    {
                        uniqueID: "mths_since_recent_bc",
                        tooltipText: "Months since most recent bankcard account opened"
                    },
                    {
                        uniqueID: "mths_since_recent_bc_dlq",
                        tooltipText: "Months since most recent bankcard delinquency"
                    },
                    {
                        uniqueID: "mths_since_recent_inq",
                        tooltipText: "Months since most recent inquiry"
                    },
                    {
                        uniqueID: "mths_since_recent_revol_delinq",
                        tooltipText: "Months since most recent revolving delinquency"
                    },                    
                    {
                        uniqueID: "next_pymnt_d",
                        tooltipText: "Next scheduled payment date"
                    },
                    {
                        uniqueID: "num_accts_ever_120_pd",
                        tooltipText: "Number of accounts ever 120 or more days past due"
                    },
                    {
                        uniqueID: "num_actv_bc_tl",
                        tooltipText: "Number of currently active bankcard accounts"
                    },
                    {
                        uniqueID: "num_actv_rev_tl",
                        tooltipText: "Number of currently active revolving trades"
                    },
                    {
                        uniqueID: "num_bc_sats",
                        tooltipText: "Number of satisfactory bankcard accounts"
                    },
                    {
                        uniqueID: "num_bc_tl",
                        tooltipText: "Number of bankcard accounts"
                    },
                    {
                        uniqueID: "num_il_tl",
                        tooltipText: "Number of installment accounts"
                    },
                    {
                        uniqueID: "num_op_rev_tl",
                        tooltipText: "Number of open revolving accounts"
                    },
                    {
                        uniqueID: "num_rev_accts",
                        tooltipText: "Number of revolving accounts"
                    },                    
                    {
                        uniqueID: "num_rev_tl_bal_gt_0",
                        tooltipText: "Number of revolving trades with balance >0"
                    },
                    {
                        uniqueID: "num_sats",
                        tooltipText: "Number of satisfactory accounts"
                    },
                    {
                        uniqueID: "num_tl_120dpd_2m",
                        tooltipText: "Number of accounts currently 120 days past due (updated in past 2 months)"
                    },
                    {
                        uniqueID: "num_tl_30dpd",
                        tooltipText: "Number of accounts currently 30 days past due (updated in past 2 months)"
                    },
                    {
                        uniqueID: "num_tl_90g_dpd_24m",
                        tooltipText: "Number of accounts 90 or more days past due in last 24 months"
                    },
                    {
                        uniqueID: "num_tl_op_past_12m",
                        tooltipText: "Number of accounts opened in past 12 months"
                    },
                    {
                        uniqueID: "open_acc",
                        tooltipText: "The number of open credit lines in the borrower's credit file"
                    },
                    {
                        uniqueID: "open_acc_6m",
                        tooltipText: "Number of open trades in last 6 months"
                    },
                    {
                        uniqueID: "open_il_12m",
                        tooltipText: "Number of installment accounts opened in past 12 months"
                    },
                    {
                        uniqueID: "open_il_24m",
                        tooltipText: "Number of installment accounts opened in past 24 months"
                    },
                    {
                        uniqueID: "open_il_6m",
                        tooltipText: "Number of currently active installment trades"
                    },
                    {
                        uniqueID: "open_rv_12m",
                        tooltipText: "Number of revolving trades opened in past 12 months"
                    },
                    {
                        uniqueID: "open_rv_24m",
                        tooltipText: "Number of revolving trades opened in past 24 months"
                    },
                    {
                        uniqueID: "out_prncp",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Remaining outstanding principal for total amount funded"
                    },
                    {
                        uniqueID: "out_prncp_inv",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Remaining outstanding principal for portion of total amount funded by investors"
                    },
                    {
                        uniqueID: "pct_tl_nvr_dlq",
                        tooltipText: "Percent of trades never delinquent"
                    },
                    {
                        uniqueID: "percent_bc_gt_75",
                        tooltipText: "Percentage of all bankcard accounts > 75% of limit"
                    },
                    {
                        uniqueID: "policy_code",
                        tooltipText: "publicly available policy_code=1\nnew products not publicly available policy_code=2"
                    },
                    {
                        uniqueID: "pub_rec",
                        tooltipText: "Number of derogatory public records"
                    },
                    {
                        uniqueID: "pub_rec_bankruptcies",
                        tooltipText: "Number of public record bankruptcies"
                    },
                    {
                        uniqueID: "purpose",
                        tooltipText: "A category provided by the borrower for the loan request"
                    },
                    {
                        uniqueID: "pymnt_plan",
                        tooltipText: "Indicates if a payment plan has been put in place for the loan"
                    },
                    {
                        uniqueID: "recoveries",
                        tooltipText: "Post charge-off gross recovery"
                    },
                    {
                        uniqueID: "revol_bal",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total credit revolving balance"
                    },             	 
                    {
                        uniqueID: "revol_bal_joint",
                        tooltipText: "Sum of revolving credit balance of the co-borrowers, net of duplicate balances",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD"
                    },
                    {
                        uniqueID: "revol_util",
                        tooltipText: "Revolving line utilization rate, or the amount of credit the borrower is using relative to all available revolving credit"
                    },
                    {
                        uniqueID: "sec_app_fico_range_low",
                        tooltipText: "FICO range (high) for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_fico_range_high",
                        tooltipText: "FICO range (low) for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_earliest_cr_line",
                        tooltipText: "Earliest credit line at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_inq_last_6mths",
                        tooltipText: "Credit inquiries in the last 6 months at time of application for the secondary applicant"
                    },             	 
                    {
                        uniqueID: "sec_app_mort_acc",
                        tooltipText: "Number of mortgage accounts at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_open_acc",
                        tooltipText: "Number of open trades at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_revol_util",
                        tooltipText: "Ratio of total current balance to high credit/credit limit for all revolving accounts"
                    },
                    {
                        uniqueID: "sec_app_open_il_6m",
                        tooltipText: "Number of currently active installment trades at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_num_rev_accts",
                        tooltipText: "Number of revolving accounts at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_chargeoff_within_12_mths",
                        tooltipText: "Number of charge-offs within last 12 months at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_collections_12_mths_ex_med",
                        tooltipText: "Number of collections within last 12 months excluding medical collections at time of application for the secondary applicant"
                    },
                    {
                        uniqueID: "sec_app_mths_since_last_major_derog",
                        tooltipText: "Months since most recent 90-day or worse rating at time of application for the secondary applicant"
                    },            	
                    {
                        uniqueID: "sub_grade",
                        tooltipText: "LC assigned loan subgrade"
                    },
                    {
                        uniqueID: "tax_liens",
                        tooltipText: "Number of tax liens"
                    },
                    {
                        uniqueID: "term",
                        tooltipText: "The number of payments on the loan. Values are in months and can be either 36 or 60."
                    },
                    {
                        uniqueID: "title",
                        tooltipText: "The loan title provided by the borrower"
                    },            	
                    {
                        uniqueID: "total_bal_ex_mort",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total credit balance excluding mortgage"
                    },
                    {
                        uniqueID: "total_bal_il",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total current balance of all installment accounts"
                    },
                    {
                        uniqueID: "total_bc_limit",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total bankcard high credit/credit limit"
                    },
                    {
                        uniqueID: "tot_coll_amt",
                        tooltipText: "Total collection amounts ever owed"
                    },
                    {
                        uniqueID: "total_acc",
                        tooltipText: "The total number of credit lines currently in the borrower's credit file"
                    },
                    {
                        uniqueID: "total_cu_tl",
                        tooltipText: "Number of finance trades"
                    },
                    {
                        uniqueID: "total_pymnt",
                        tooltipText: "Payments received to date for total amount funded"
                    },
                    {
                        uniqueID: "total_pymnt_inv",
                        tooltipText: "Payments received to date for portion of total amount funded by investors"
                    },            	
                    {
                        uniqueID: "total_rec_int",
                        tooltipText: "Interest received to date"
                    },            	
                    {
                        uniqueID: "total_rec_late_fee",
                        tooltipText: "Late fees received to date"
                    },            	
                    {
                        uniqueID: "total_rec_prncp",
                        tooltipText: "Principal received to date"
                    },
                    {
                        uniqueID: "tot_cur_bal",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total current balance of all accounts"
                    },
                    {
                        uniqueID: "tot_hi_cred_lim",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total high credit/credit limit"
                    },
                    {
                        uniqueID: "total_il_high_credit_limit",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total installment high credit/credit limit"
                    },
                    {
                        uniqueID: "total_rev_hi_lim",
                        defaultNumericFormattingObjPos: 0,
                        currency: "USD",
                        tooltipText: "Total revolving high credit/credit limit" 
                    },                    
                    {
                        uniqueID: "url",
                        tooltipText: "URL for the LC page with listing data"
                    },
                    {
                        uniqueID: "verification_status",
                        tooltipText: "Indicates if income was verified by LC, not verified, or if the income source was verified"
                    },
                    {
                        uniqueID: "verified_status_joint",
                        tooltipText: "Indicates if the co-borrowers' joint income was verified by LC, not verified, or if the income source was verified"
                    },
                    {
                        uniqueID: "zip_code",
                        tooltipText: "The first 3 numbers of the zip code provided by the borrower in the loan application"
                    }
                )
            }
        }
    }
};
