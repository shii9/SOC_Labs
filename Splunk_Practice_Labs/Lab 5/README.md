# Lab 5: Splunk Dashboard for Web Traffic Logs & Apache Telemetry

## Overview & Scenario
In this lab, you assume the role of a **SOC Dashboard Engineer & Web Security Analyst** responsible for monitoring enterprise web server infrastructure and building an interactive **Web Traffic Monitoring & Threat Intelligence Dashboard** in Splunk.

The dataset contains **2,000 JSON log entries** representing Apache access logs. Each entry captures critical HTTP telemetry, including client IP addresses, timestamps, HTTP request methods, targeted URIs, HTTP response status codes, payload transfer sizes (bytes), HTTP referrers, and client User-Agent strings.

Your primary objective is to use **Splunk Search Processing Language (SPL)** and Splunk visualization components (Single Value KPIs, Column/Bar Charts, and Choropleth Geographic Maps) to construct an executive operational dashboard. You will also perform threat hunting to detect malicious referral campaigns, directory enumeration, bot probing, and unauthorized resource access.

---

## Dataset Details
- **File Name**: `apache_logs.json` (also packaged as `apache_logs.zip`)
- **Total Log Count**: 2,000 events
- **Log Format**: JSON (Structured Apache Web Access Logs)
- **Recommended Splunk Sourcetype**: `_json` or `access:json`
- **Recommended Index**: `web_dash_lab` or `main`

### Sample Log Structure
```json
{
  "ip": "185.62.57.52",
  "timestamp": "17/Sep/2025:12:00:00 +0530",
  "method": "GET",
  "uri": "/upload.php",
  "protocol": "HTTP/1.1",
  "status": 200,
  "bytes": 1374,
  "referrer": "-",
  "user_agent": "python-requests/2.25.1"
}
```

### Key Fields Reference
| Field | Data Type | Description |
| :--- | :--- | :--- |
| `ip` | String (IPv4) | Source/Client IP address issuing the HTTP request |
| `timestamp` | String (DateTime) | Request timestamp with timezone offset (`+0530`) |
| `method` | String | HTTP verb (e.g., `GET`, `POST`) |
| `uri` | String | Target URI path or query string (e.g., `/upload.php`, `/?ref=...`) |
| `protocol` | String | HTTP protocol version (`HTTP/1.1`) |
| `status` | Integer | HTTP response status code (e.g., `200`, `302`, `401`, `403`, `404`, `500`, `503`) |
| `bytes` | Integer | Size of the server response body in bytes |
| `referrer` | String | HTTP Referer header indicating source link |
| `user_agent` | String | Client application/browser signature |

---

## Splunk Data Ingestion Setup

To ingest this dataset into your Splunk environment:
1. Log in to **Splunk Enterprise** (or Splunk Cloud / Docker Splunk).
2. Navigate to **Settings > Add Data > Upload**.
3. Select `Lab 5/apache_logs.json` (or extract `Lab 5/apache_logs.zip`).
4. Set **Source Type** to `_json`.
5. Under **Input Settings**, select or create an index named `web_dash_lab` (or use `main`).
6. Review the settings, click **Submit**, and open **Search & Reporting**.

---

## Lab Tasks & Hands-On Exercises

### Task 0: Base Dashboard & Global Time Range Token Setup
**Objective**: Create a centralized dashboard and configure a global time picker input to dynamically filter all visualizations.

1. In Splunk Search, run: `index=main sourcetype="_json"` (or `index=web_dash_lab`).
2. Click **Save As > Existing Dashboard** or **New Dashboard**.
3. Name the dashboard **Web Traffic Operations & Security Center**.
4. In Edit Mode, click **Add Input > Time**.
5. Set the token name to `time_range`.
6. Configure panel searches to utilize the time range token (`earliest="$time_range.earliest$"` and `latest="$time_range.latest$"`).

---

### Task 1: Web Activities (Single Value KPI Panels)

Create high-level operational metric cards to provide instant situational awareness on total traffic volume and error health.

#### 1.1 Total Web Requests
**Objective**: Measure the total number of HTTP requests processed by the web server fleet.

```spl
index=main sourcetype="_json"
| stats count AS "Total Web Requests"
```
- **Visualization**: Single Value
- **Panel Title**: Total Web Requests
- **Expected Value**: 2,000

---

#### 1.2 Successful Responses (HTTP 200)
**Objective**: Track healthy, successful transactions served by the web application.

```spl
index=main sourcetype="_json" method=GET status=200
| stats count AS "Successful Responses"
```
- **Visualization**: Single Value
- **Color Configuration**: Green / Static Success `#1e824c`
- **Panel Title**: Successful Responses
- **Expected Value**: 1,168

---

#### 1.3 Client Errors (HTTP 4xx)
**Objective**: Quantify client-side errors (401 Unauthorized, 403 Forbidden, 404 Not Found) to spot broken links and scanning activity.

```spl
index=main sourcetype="_json"
| where status>=400 AND status<500
| stats count AS "Client Errors"
```
- **Visualization**: Single Value
- **Color Configuration**: Amber / Warning `#d35400`
- **Panel Title**: Client Errors
- **Expected Value**: 376 (404: 158, 403: 132, 401: 86)

---

#### 1.4 Server Errors (HTTP 5xx)
**Objective**: Measure server-side failures (500 Internal Server Error, 503 Service Unavailable) indicating service disruptions or application crashes.

```spl
index=main sourcetype="_json"
| where status>=500 AND status<600
| stats count AS "Server Errors"
```
- **Visualization**: Single Value
- **Color Configuration**: Red / Severe `#c0392b`
- **Panel Title**: Server Errors
- **Expected Value**: 167 (503: 90, 500: 77)

---

### Task 2: Web Stats & Endpoint Profiling

#### 2.1 Top Requested URIs
**Objective**: Identify the most frequently accessed web endpoints and parameter paths across the server.

```spl
index=main sourcetype="_json"
| stats count AS "Hits" by uri
| sort - Hits
| head 10
```
- **Visualization**: Column Chart / Bar Chart
- **Panel Title**: Top 10 Requested URIs
- **Key Finding**: Heavy concentration on suspicious parameter queries (`/?ref=http://phishingsite.net` with 206 hits, `/?ref=http://malicious-spam-site.com` with 197 hits) along with sensitive paths (`/private/data`, `/forbidden/page`, `/secret/admin`).

---

#### 2.2 Top Users / Clients by IP Address
**Objective**: Discover the highest volume source IP addresses making requests to the web infrastructure.

```spl
index=main sourcetype="_json"
| stats count AS "Request_Count" by ip
| sort - Request_Count
| head 10
| rename ip as "Client_IP"
```
- **Visualization**: Column Chart / Bar Chart
- **Panel Title**: Top Active Client IPs
- **Key Finding**: Top active IP addresses include `185.62.57.5` (16 hits), `103.21.244.9` (15 hits), `103.21.244.31` (15 hits), and `185.62.57.89` (15 hits).

---

### Task 3: Geographic Distribution (Choropleth Map)

#### 3.1 Web Traffic by Client IP Addresses
**Objective**: Perform GeoIP resolution on client IPs and plot the geographic density of traffic on a global choropleth map.

```spl
index=main sourcetype="_json"
| table ip
| iplocation ip
| stats count by Country
| geom geo_countries featureIdField="Country"
```
- **Visualization**: Choropleth Map (or Cluster Map)
- **Panel Title**: Web Traffic by Geographic Origin
- **Configuration**: Splunk Shape mode `geo_countries`, feature ID field `Country`.

---

### Task 4: Advanced Web Threat Hunting & Security Investigation

#### 4.1 Malicious Referral & Open Redirect Spam Campaign
**Objective**: Investigate the high volume of incoming traffic with external phishing and spam domains embedded in the `uri` parameter.

```spl
index=main sourcetype="_json" uri="*phishingsite*" OR uri="*malicious*"
| stats count by uri, ip, status
| sort - count
```
- **Analysis**: 403 total requests targeted phishing/spam referral parameters (`/?ref=http://phishingsite.net` and `/?ref=http://malicious-spam-site.com`), indicating a referrer spam/open redirect probe.

---

#### 4.2 Probing for Restricted & Sensitive Resources
**Objective**: Identify client attempts to access administrative and restricted areas.

```spl
index=main sourcetype="_json" uri IN ("/private/data", "/forbidden/page", "/secret/admin")
| stats count by uri, status, ip
| sort uri, - count
```
- **Analysis**: Over 300 requests attempted to access confidential paths, returning 401 Unauthorized and 403 Forbidden status codes.

---

#### 4.3 Automated Tool & Bot Profiling
**Objective**: Categorize client traffic based on User-Agent signatures to differentiate legitimate human browsers from automated scanners.

```spl
index=main sourcetype="_json"
| eval Agent_Type = case(
    match(user_agent, "(?i)python-requests"), "Python Script / Automated Tool",
    match(user_agent, "(?i)bingbot"), "Search Engine Crawler (Bingbot)",
    match(user_agent, "(?i)iphone"), "Mobile Browser (iOS)",
    match(user_agent, "(?i)macintosh"), "Desktop Browser (macOS)",
    match(user_agent, "(?i)windows"), "Desktop Browser (Windows)",
    match(user_agent, "(?i)linux"), "Desktop Browser (Linux)",
    true(), "Other / Unknown"
)
| stats count by Agent_Type
| sort - count
```
- **Visualization**: Pie Chart / Doughnut Chart
- **Analysis**: Uncovers bot activity including automated Python scripts (`python-requests/2.25.1`) and web crawlers (`Bingbot/2.0`).

---

#### 4.4 Bandwidth & Payload Size Analysis
**Objective**: Calculate the total data transfer and average response size across different URI endpoints.

```spl
index=main sourcetype="_json"
| stats count, sum(bytes) as Total_Bytes, avg(bytes) as Avg_Bytes by uri
| eval Total_MB = round(Total_Bytes / 1048576, 2), Avg_KB = round(Avg_Bytes / 1024, 2)
| table uri, count, Total_MB, Avg_KB
| sort - Total_MB
| head 10
```
- **Analysis**: Surfaces bandwidth-heavy endpoints and potential data exfiltration vectors.

---

## 🖥️ Complete Splunk Dashboard XML Source Code

You can directly copy and paste the XML below into Splunk's **Source** editor to instantly deploy the entire interactive dashboard:

```xml
<form version="1.1" theme="dark">
  <label>Web Traffic Operations &amp; Security Center</label>
  <description>Real-Time Apache Web Server Telemetry, KPI Metrics, and Threat Intelligence</description>
  
  <fieldset submitButton="false" autoRun="true">
    <input type="time" token="time_range">
      <label>Select Time Range</label>
      <default>
        <earliest>0</earliest>
        <latest></latest>
      </default>
    </input>
  </fieldset>

  <!-- Row 1: KPI Single Value Cards -->
  <row>
    <panel>
      <single>
        <title>Total Web Requests</title>
        <search>
          <query>index=main sourcetype="_json" | stats count AS "Total Web Requests"</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="colorMode">block</option>
        <option name="rangeColors">["0x53a051","0x006d9c"]</option>
        <option name="underLabel">All Ingested HTTP Requests</option>
        <option name="useColors">1</option>
      </single>
    </panel>
    <panel>
      <single>
        <title>Successful Responses (200 OK)</title>
        <search>
          <query>index=main sourcetype="_json" method=GET status=200 | stats count AS "Successful Responses"</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="colorMode">block</option>
        <option name="rangeColors">["0x53a051","0x53a051"]</option>
        <option name="underLabel">HTTP 200 Status Code</option>
        <option name="useColors">1</option>
      </single>
    </panel>
    <panel>
      <single>
        <title>Client Errors (4xx)</title>
        <search>
          <query>index=main sourcetype="_json" | where status&gt;=400 AND status&lt;500 | stats count AS "Client Errors"</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="colorMode">block</option>
        <option name="rangeColors">["0xf1813f","0xf1813f"]</option>
        <option name="underLabel">401, 403, 404 Status Codes</option>
        <option name="useColors">1</option>
      </single>
    </panel>
    <panel>
      <single>
        <title>Server Errors (5xx)</title>
        <search>
          <query>index=main sourcetype="_json" | where status&gt;=500 AND status&lt;600 | stats count AS "Server Errors"</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="colorMode">block</option>
        <option name="rangeColors">["0xdc4e41","0xdc4e41"]</option>
        <option name="underLabel">500, 503 Status Codes</option>
        <option name="useColors">1</option>
      </single>
    </panel>
  </row>

  <!-- Row 2: Traffic Statistics & Endpoint Profiling -->
  <row>
    <panel>
      <chart>
        <title>Top 10 Requested URIs</title>
        <search>
          <query>index=main sourcetype="_json" | stats count AS "Hits" by uri | sort - Hits | head 10</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="charting.chart">bar</option>
        <option name="charting.drilldown">none</option>
        <option name="charting.legend.placement">none</option>
      </chart>
    </panel>
    <panel>
      <chart>
        <title>Top Users / Clients by IP Address</title>
        <search>
          <query>index=main sourcetype="_json" | stats count AS "Requests" by ip | sort - Requests | head 10</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="charting.chart">column</option>
        <option name="charting.drilldown">none</option>
        <option name="charting.legend.placement">none</option>
      </chart>
    </panel>
  </row>

  <!-- Row 3: Geographic Distribution Map -->
  <row>
    <panel>
      <viz type="splunk_mapping.choropleth">
        <title>Web Traffic by Client IP Geographic Origin</title>
        <search>
          <query>index=main sourcetype="_json" | table ip | iplocation ip | stats count by Country | geom geo_countries featureIdField="Country"</query>
          <earliest>$time_range.earliest$</earliest>
          <latest>$time_range.latest$</latest>
        </search>
        <option name="splunk_mapping.choropleth.colorBins">5</option>
        <option name="splunk_mapping.choropleth.colorMode">categorical</option>
        <option name="splunk_mapping.choropleth.maximumColor">0xAF5757</option>
        <option name="splunk_mapping.choropleth.minimumColor">0x62B3B2</option>
        <option name="splunk_mapping.choropleth.shapeOpacity">0.75</option>
      </viz>
    </panel>
  </row>
</form>
```

---

## 📝 Lab Assessment & Knowledge Check

### Question 1: Global Time Filter Integration
**Question**: What is the purpose of adding a time range input and configuring token filters in a Splunk dashboard?
- **A)** To restrict database access to specific user roles
- **B)** To dynamically update the earliest and latest timestamps across all visualization panels simultaneously
- **C)** To compress log files stored in cold buckets
- **D)** To encrypt web server communications with TLS
- **Correct Answer**: **B**
- **Explanation**: A time input token (e.g., `$time_range.earliest$` / `$time_range.latest$`) allows users to adjust the investigation window across all dashboard panels dynamically from a single control.

---

### Question 2: Single Value Panel Logic
**Question**: Which SPL command accurately computes the total volume of successful HTTP GET requests returning status 200?
- **A)** `index=main sourcetype="_json" method=GET status=200 | stats count AS "Successful Responses"`
- **B)** `index=main | search status!=500 | eval success=1`
- **C)** `index=main | where status=404 | stats count`
- **D)** `index=main | stats avg(bytes) by status`
- **Correct Answer**: **A**
- **Explanation**: Filtering for `method=GET status=200` and aggregating with `stats count` isolates and measures successful transactions.

---

### Question 3: HTTP Error Code Classification
**Question**: In Apache access logs, which range represents client errors such as `401 Unauthorized` and `404 Not Found`?
- **A)** 100 - 199
- **B)** 200 - 299
- **C)** 400 - 499
- **D)** 500 - 599
- **Correct Answer**: **C**
- **Explanation**: HTTP 4xx codes represent client-side errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found), while 5xx codes represent server-side failures.

---

### Question 4: Geographic IP Mapping Command
**Question**: Which Splunk command resolves IPv4 addresses into geographic attributes such as Country, City, Region, Latitude, and Longitude?
- **A)** `geostats`
- **B)** `iplocation`
- **C)** `lookup geoip`
- **D)** `eval geo_ip=ip`
- **Correct Answer**: **B**
- **Explanation**: `iplocation` queries Splunk's internal MaxMind GeoIP database to enrich log events with geographic location fields like `Country`, `City`, `lat`, and `lon`.

---

## 🎯 Conclusion & Key Takeaways

1. **Operational Health Monitoring**: Implementing Single Value KPI panels for Total Requests, Successes (200), Client Errors (4xx), and Server Errors (5xx) gives SOC and Web Ops teams instant visibility into service health.
2. **Endpoint Behavior Profiling**: Analyzing URI distributions quickly identifies high-traffic targets and flags abnormal patterns like referrer spam (`/?ref=...`) and unauthorized access attempts (`/private/data`, `/secret/admin`).
3. **Geographic Situational Awareness**: Enriching IP telemetry with `iplocation` and `geom` renders global origin patterns, highlighting traffic anomalies from unexpected regions.
4. **Automated Threat Detection**: Distinguishing between legitimate browser User-Agents and automated tools (`python-requests`) assists analysts in prioritizing bot mitigation and rate-limiting policies.
