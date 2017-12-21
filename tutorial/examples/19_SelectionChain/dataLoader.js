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



var classes = {

    /*--------------------
    General Class for loading data 
    Requeres: 
    - uploadedData: e.g. [databel, "filepath"]
    Provides:
    - attributes: column names
    - data: the data (one entry per row)
    --------------------*/
    DataLoader: {
        context: {
            // this fetches the csv from the eu portal (ideal for the final demo)
            // uploadedData: [datatable, "https://cohesiondata.ec.europa.eu/api/views/3kkx-ekfq/rows.csv?accessType=DOWNLOAD"],            

            // for this you'd need to start chrome with: open -a "Google Chrome" --args --allow-file-access-from-files
            uploadedData: [datatable, "../../../../data/ESIF_2014-2020_planned_vs_implemented.csv"],

            // for this you'll need to start a local file server
            //uploadedData: [datatable, "http://127.0.0.1:8887/ESIF_2014-2020_categorisation_ERDF-ESF-CF_planned_vs_implemented.csv"],                        

            attributes: [{ uploadedData: { attributes: { name: _ } } }, [me]],
            data: [{ uploadedData: { data: _ } }, [me]],
            //countries: [_, [{MS: _}, [{ data: _ }, [me]]]]
        },
    }
}

