using System;
using System.Collections.Generic;
using System.Text;
using SERVIDAL;
using SERVDataContract.DbLinq;
using System.Data;
using System.Data.Common;
using SERV.Utils.Data;
using System.Linq;

namespace SERVDAL
{
	public class ListDAL : IListDAL
	{

		//static Logger log = new Logger();
		private SERVDataContract.DbLinq.SERVDB db;

		public ListDAL()
		{
			db = new SERVDataContract.DbLinq.SERVDB(System.Configuration.ConfigurationManager.AppSettings["ConnectionString"]);
		}

		public List<VehicleType> ListVehicleTypes()
		{
			return (from l in db.VehicleType where l.Enabled == 1 select l).ToList();
		}

		public List<SERVDBGROUp> ListGroups()
		{
			return (from g in db.SERVDBGROUp select g).ToList();
		}

		public void Dispose()
		{
			db.Dispose();
		}

	}
}

