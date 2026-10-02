import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";

export async function getInstallationById(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  const installation = await prisma.solarInstallation.findUnique({
    where: { id: installationId },
    include: {
      substation: {
        include: {
          district: {
            include: {
              province: true,
            },
          },
        },
      },
    },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }

  return res.status(200).json(serializeData(installation));
}


export async function getLastKnownReading(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  const installation = await prisma.solarInstallation.findUnique({
    where: { id: installationId },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }

  const reading = await prisma.generationReading.findFirst({
    where: {
      installationId,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!reading) {
    return res.status(404).json({
      code: "READING_NOT_FOUND",
      message: "No generation reading found.",
      detail: `No generation reading exists for installation ${installationId}.`,
    });
  }

  return res.status(200).json(serializeData(reading));
}


export async function getInstallationReadings(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);


  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  
  const installation = await prisma.solarInstallation.findUnique({
    where: {
      id: installationId,
    },
    include: {
      substation: {
        include: {
          district: true,
        },
      },
    },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }

 
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const sort = String(req.query.sort ?? "timestamp");
  const order = String(req.query.order ?? "desc");

  const from = req.query.from
    ? String(req.query.from)
    : undefined;

  const to = req.query.to
    ? String(req.query.to)
    : undefined;

  const provinceId = req.query.provinceId
    ? Number(req.query.provinceId)
    : undefined;

  const districtId = req.query.districtId
    ? Number(req.query.districtId)
    : undefined;

  const substationId = req.query.substationId
    ? Number(req.query.substationId)
    : undefined;

  
  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    return res.status(400).json({
      code: "INVALID_PAGE",
      message: "Page must be a positive integer.",
      detail: "Use a value such as page=1.",
    });
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      code: "INVALID_LIMIT",
      message: "Limit must be between 1 and 100.",
      detail: "Use a value such as limit=20.",
    });
  }

 
  if (sort !== "timestamp") {
    return res.status(400).json({
      code: "INVALID_SORT",
      message: "Invalid sort field.",
      detail: "Only timestamp sorting is supported.",
    });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({
      code: "INVALID_ORDER",
      message: "Invalid sort order.",
      detail: "Order must be either asc or desc.",
    });
  }


  if (
    provinceId !== undefined &&
    !Number.isInteger(provinceId)
  ) {
    return res.status(400).json({
      code: "INVALID_PROVINCE_ID",
      message: "Province ID must be an integer.",
      detail: "The provinceId query parameter is invalid.",
    });
  }

  if (
    districtId !== undefined &&
    !Number.isInteger(districtId)
  ) {
    return res.status(400).json({
      code: "INVALID_DISTRICT_ID",
      message: "District ID must be an integer.",
      detail: "The districtId query parameter is invalid.",
    });
  }

  if (
    substationId !== undefined &&
    !Number.isInteger(substationId)
  ) {
    return res.status(400).json({
      code: "INVALID_SUBSTATION_ID",
      message: "Substation ID must be an integer.",
      detail: "The substationId query parameter is invalid.",
    });
  }

  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  if (from) {
    fromDate = new Date(from);

    if (Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({
        code: "INVALID_FROM_DATE",
        message: "Invalid from date.",
        detail: "Use a valid ISO 8601 date.",
      });
    }
  }

  if (to) {
    toDate = new Date(to);

    if (Number.isNaN(toDate.getTime())) {
      return res.status(400).json({
        code: "INVALID_TO_DATE",
        message: "Invalid to date.",
        detail: "Use a valid ISO 8601 date.",
      });
    }
  }

  if (
    fromDate &&
    toDate &&
    fromDate > toDate
  ) {
    return res.status(400).json({
      code: "INVALID_TIME_RANGE",
      message: "Invalid time range.",
      detail: "The from date must be earlier than or equal to the to date.",
    });
  }

 
  const jurisdictionConditions: any[] = [];

  if (provinceId !== undefined) {
    jurisdictionConditions.push({
      substation: {
        district: {
          provinceId,
        },
      },
    });
  }

  if (districtId !== undefined) {
    jurisdictionConditions.push({
      substation: {
        districtId,
      },
    });
  }

  if (substationId !== undefined) {
    jurisdictionConditions.push({
      substationId,
    });
  }

 
  const dateConditions: any = {};

  if (fromDate) {
    dateConditions.gte = fromDate;
  }

  if (toDate) {
    dateConditions.lte = toDate;
  }


  const where: any = {
    installationId,
  };

  if (Object.keys(dateConditions).length > 0) {
    where.timestamp = dateConditions;
  }

  if (jurisdictionConditions.length > 0) {
    where.AND = jurisdictionConditions;
  }

 
  const skip = (page - 1) * limit;


  const [totalCount, readings] = await Promise.all([
  prisma.generationReading.count({
    where: {
      installationId,
    },
  }),

  prisma.generationReading.findMany({
    where: {
      installationId,
    },
    orderBy: {
      timestamp: "asc",
    },
  }),
]);

 
  const totalPages =
    totalCount === 0
      ? 0
      : Math.ceil(totalCount / limit);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;

  const createUrl = (targetPage: number) => {
    const params = new URLSearchParams();

    params.set("page", String(targetPage));
    params.set("limit", String(limit));
    params.set("sort", sort);
    params.set("order", order);

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    if (provinceId !== undefined) {
      params.set("provinceId", String(provinceId));
    }

    if (districtId !== undefined) {
      params.set("districtId", String(districtId));
    }

    if (substationId !== undefined) {
      params.set("substationId", String(substationId));
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const next =
    page < totalPages
      ? createUrl(page + 1)
      : null;

  const previous =
    page > 1 && totalPages > 0
      ? createUrl(page - 1)
      : null;

  
  return res.status(200).json({
    page,
    limit,
    totalCount,
    totalPages,
    next,
    previous,
    items: serializeData(readings),
  });
}