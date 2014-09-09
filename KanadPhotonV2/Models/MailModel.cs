using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KanadPhotonV2.Models
{
    public class MailModel
    {
        
        public string Subject { get; set; }
        public string FirmName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactName { get; set; }
        public string ContactPhone { get; set; }
        public string Query { get; set; }
        public string OriginationDetails { get; set; }
    }
}