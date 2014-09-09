using System.Web;
using System.Web.Mvc;
using KanadPhotonV2.Helpers;

namespace KanadPhotonV2
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
